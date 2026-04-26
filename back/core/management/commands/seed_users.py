from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType
from django_seed import Seed
from django.utils import timezone
import random
from decimal import Decimal

from listings.models import Municipality, Property, Amenity, PropertyImage
from tours.models import Tour
from deals.models import Sale, PendingSaleRequest


class Command(BaseCommand):
    help = 'Seed database: Groups → Users (with group join) → Tables → Permissions'

    MUNICIPALITY_PRICE_TIERS = {
        "PREMIUM": (55000, 95000),
        "URBAN": (30000, 55000),
        "SUBURBAN": (15000, 30000),
        "RURAL": (6000, 15000),
    }
    MUNICIPALITY_TIER_WEIGHTS = [
        ("PREMIUM", 0.15),
        ("URBAN", 0.35),
        ("SUBURBAN", 0.35),
        ("RURAL", 0.15),
    ]

    SALE_CATEGORY_MULTIPLIERS = {
        "HOUSE_AND_LOT": Decimal("1.00"),
        "LOT": Decimal("0.90"),
        "APARTMENT": Decimal("1.08"),
        "CONDO": Decimal("1.12"),
        "COMMERCIAL_SPACE": Decimal("1.18"),
    }
    SALE_BUILDING_WEIGHTS = {
        "HOUSE_AND_LOT": Decimal("0.35"),
        "LOT": Decimal("0.00"),
        "APARTMENT": Decimal("0.65"),
        "CONDO": Decimal("0.75"),
        "COMMERCIAL_SPACE": Decimal("0.60"),
    }
    CONDITION_MODIFIERS = {
        "NEW": Decimal("1.12"),
        "GOOD": Decimal("1.00"),
        "FAIR": Decimal("0.90"),
        "POOR": Decimal("0.80"),
    }
    LOCATION_MODIFIERS = {
        "PREMIUM": Decimal("1.20"),
        "URBAN": Decimal("1.08"),
        "SUBURBAN": Decimal("1.00"),
        "RURAL": Decimal("0.92"),
    }

    def add_arguments(self, parser):
        parser.add_argument(
            'number_positional',
            nargs='?',
            type=int,
            help='Optional positional number of records to seed'
        )
        parser.add_argument(
            '--number',
            type=int,
            default=10
        )
        parser.add_argument(
            '--no-superadmin',
            action='store_true',
            help='Skip creating/updating the default superadmin account'
        )

    def _pick_municipality_tier(self):
        tiers = [tier for tier, _ in self.MUNICIPALITY_TIER_WEIGHTS]
        weights = [weight for _, weight in self.MUNICIPALITY_TIER_WEIGHTS]
        return random.choices(tiers, weights=weights, k=1)[0]

    def _calculate_seeded_amenity_impact(self, property_obj):
        amenities = property_obj.amenities.all().order_by("-price")
        total = Decimal("0")
        for idx, amenity in enumerate(amenities):
            value = Decimal(str(amenity.price))
            if amenity.amenity_type == "Basic":
                value = min(value, Decimal("100000"))
            elif amenity.amenity_type == "Luxury":
                value = min(value, Decimal("250000"))
            decay = Decimal("1") + (Decimal("0.20") * Decimal(idx))
            total += value / decay
        return total

    def _calculate_seeded_sale_price(self, property_obj):
        lot_size = Decimal(str(property_obj.property_size or 0))
        building_size = Decimal(str(property_obj.building_size or 0))
        municipal_rate = Decimal(str(property_obj.property_municipality.price_per_sqm or 0))

        base = lot_size * municipal_rate
        category_mod = self.SALE_CATEGORY_MULTIPLIERS.get(property_obj.category, Decimal("1.00"))
        condition_mod = self.CONDITION_MODIFIERS.get(property_obj.condition, Decimal("1.00"))
        location_mod = self.LOCATION_MODIFIERS.get(property_obj.location_quality, Decimal("1.00"))
        building_weight = self.SALE_BUILDING_WEIGHTS.get(property_obj.category, Decimal("0.35"))

        building_component = building_size * municipal_rate * building_weight
        bed_component = Decimal(str(max(property_obj.num_bedrooms or 0, 0) * 120000))
        bath_component = Decimal(str(max(property_obj.num_bathrooms or 0, 0) * 90000))
        amenity_component = self._calculate_seeded_amenity_impact(property_obj)

        subtotal = (base * category_mod * condition_mod * location_mod) + building_component + bed_component + bath_component + amenity_component
        noise_multiplier = Decimal(str(random.uniform(0.97, 1.03)))
        final_price = subtotal * noise_multiplier
        return int(max(800000, final_price.quantize(Decimal("1"))))

    def handle(self, *args, **options):
        number = options.get('number_positional') if options.get('number_positional') is not None else options['number']
        create_superadmin = not options['no_superadmin']
        seeder = Seed.seeder()

        # =====================================================================
        # STEP 1: Create Groups (NO permissions yet — tables don't exist)
        # =====================================================================
        self.stdout.write(self.style.WARNING('STEP 1: Creating groups...'))

        group_names = ['SuperAdmin', 'Admin', 'Agent', 'Verified Agents', 'Owner', 'Buyer']
        groups = {}

        for group_name in group_names:
            group, created = Group.objects.get_or_create(name=group_name)
            groups[group_name] = group
            if created:
                self.stdout.write(f'  ✓ Created group: {group_name}')
            else:
                self.stdout.write(f'  • Group already exists: {group_name}')

        # =====================================================================
        # STEP 2: Create Users and assign them to groups immediately
        # =====================================================================
        self.stdout.write(self.style.WARNING('\nSTEP 2: Creating superuser...'))

        if create_superadmin:
            # Create a superuser for admin access
            superuser_username = 'superadmin@realestate.com'  # Use email as username for login
            superuser_email = 'superadmin@realestate.com'
            superuser_password = 'superadmin123'

            superuser, created = User.objects.get_or_create(
                username=superuser_username,
                defaults={
                    'email': superuser_email,
                    'first_name': 'Super',
                    'last_name': 'Admin',
                }
            )
            if created:
                superuser.set_password(superuser_password)
            superuser.is_staff = True
            superuser.is_superuser = True
            superuser.save()
            superuser.groups.add(groups['SuperAdmin'])
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Created superuser: {superuser_username} (password: {superuser_password})'))
            else:
                self.stdout.write(self.style.SUCCESS(f'  • Superuser already exists: {superuser_username}'))
        else:
            self.stdout.write('  • Skipped superadmin creation (--no-superadmin)')

        self.stdout.write(self.style.WARNING('\nSTEP 3: Creating users with group assignments...'))

        # Create Admin users
        for i in range(max(1, number // 10)):
            user, created = User.objects.get_or_create(
                username=f'admin_{i}',
                defaults={
                    'email': f'admin{i}@realestate.com',
                    'first_name': seeder.faker.first_name(),
                    'last_name': seeder.faker.last_name()
                }
            )
            if created:
                user.set_password('password123')
            user.is_staff = True
            user.is_superuser = False
            user.save()
            user.groups.add(groups['Admin'])
            if created:
                self.stdout.write(f'  ✓ Created Admin: {user.username}')

        # Create Agent users
        for i in range(max(2, number // 5)):
            user, created = User.objects.get_or_create(
                username=f'agent_{i}',
                defaults={
                    'email': f'agent{i}@realestate.com',
                    'first_name': seeder.faker.first_name(),
                    'last_name': seeder.faker.last_name()
                }
            )
            if created:
                user.set_password('password123')
            user.is_staff = False
            user.is_superuser = False
            user.save()
            user.groups.add(groups['Agent'])
            # Keep verified agents in both groups for compatibility
            if i % 2 == 0:
                user.groups.add(groups['Verified Agents'])
            if created:
                self.stdout.write(f'  ✓ Created Agent: {user.username}')

        # Create Owner users
        for i in range(max(2, number // 5)):
            user, created = User.objects.get_or_create(
                username=f'owner_{i}',
                defaults={
                    'email': f'owner{i}@realestate.com',
                    'first_name': seeder.faker.first_name(),
                    'last_name': seeder.faker.last_name()
                }
            )
            if created:
                user.set_password('password123')
            user.is_staff = False
            user.is_superuser = False
            user.save()
            user.groups.add(groups['Owner'])
            if created:
                self.stdout.write(f'  ✓ Created Owner: {user.username}')

        # Create Buyer users
        for i in range(max(2, number // 5)):
            user, created = User.objects.get_or_create(
                username=f'buyer_{i}',
                defaults={
                    'email': f'buyer{i}@realestate.com',
                    'first_name': seeder.faker.first_name(),
                    'last_name': seeder.faker.last_name()
                }
            )
            if created:
                user.set_password('password123')
            user.is_staff = False
            user.is_superuser = False
            user.save()
            user.groups.add(groups['Buyer'])
            if created:
                self.stdout.write(f'  ✓ Created Buyer: {user.username}')

        # =====================================================================
        # STEP 4: Create data tables (Municipalities, Properties, etc.)
        # =====================================================================
        self.stdout.write(self.style.WARNING('\nSTEP 4: Creating data tables...'))

        # Create Municipalities
        municipalities = []
        municipality_tiers = {}
        for i in range(max(3, number // 3)):
            tier = self._pick_municipality_tier()
            min_price, max_price = self.MUNICIPALITY_PRICE_TIERS[tier]
            municipality, created = Municipality.objects.get_or_create(
                municipality_name=seeder.faker.unique.city(),
                defaults={
                    'price_per_sqm': random.randint(min_price, max_price)
                }
            )
            municipalities.append(municipality)
            municipality_tiers[municipality.id] = tier
            if created:
                self.stdout.write(f'  ✓ Created Municipality: {municipality.municipality_name} ({tier})')

        # Get all users for assignments
        owners = list(User.objects.filter(groups__name='Owner'))
        agents = list(User.objects.filter(groups__name__in=['Agent', 'Verified Agents']).distinct())
        buyers = list(User.objects.filter(groups__name='Buyer'))
        all_users = list(User.objects.all())

        # Create Properties
        properties = []
        category_choices = ['HOUSE_AND_LOT', 'LOT', 'APARTMENT', 'CONDO', 'COMMERCIAL_SPACE']
        for i in range(number):
            owner = random.choice(owners) if owners else None
            agent = random.choice(agents) if agents else None
            municipality = random.choice(municipalities)
            category = random.choice(category_choices)
            tier = municipality_tiers.get(municipality.id) or self._pick_municipality_tier()

            lot_size = random.randint(70, 800)
            if category == 'LOT':
                building_size = 0
                bedrooms = 0
                bathrooms = 0
            elif category in ['APARTMENT', 'CONDO']:
                building_size = random.randint(28, 220)
                bedrooms = random.randint(1, 4)
                bathrooms = random.randint(1, 3)
            elif category == 'COMMERCIAL_SPACE':
                building_size = random.randint(60, 450)
                bedrooms = 0
                bathrooms = random.randint(1, 4)
            else:  # HOUSE_AND_LOT
                building_size = random.randint(50, min(420, lot_size))
                bedrooms = random.randint(1, 6)
                bathrooms = random.randint(1, 4)

            location_by_tier = {
                "PREMIUM": random.choices(["PREMIUM", "URBAN"], weights=[0.75, 0.25], k=1)[0],
                "URBAN": random.choices(["URBAN", "SUBURBAN", "PREMIUM"], weights=[0.65, 0.25, 0.10], k=1)[0],
                "SUBURBAN": random.choices(["SUBURBAN", "URBAN", "RURAL"], weights=[0.70, 0.20, 0.10], k=1)[0],
                "RURAL": random.choices(["RURAL", "SUBURBAN"], weights=[0.80, 0.20], k=1)[0],
            }
            condition = random.choices(
                ["NEW", "GOOD", "FAIR", "POOR"],
                weights=[0.20, 0.50, 0.22, 0.08],
                k=1
            )[0]
            location_quality = location_by_tier.get(tier, "SUBURBAN")

            listing_type = random.choice(['SALE', 'RENT'])
            if listing_type == 'RENT':
                # Cap demo rental prices to 100k/month.
                seeded_price = random.randint(8000, 100000)
            else:
                # Temporary placeholder. Realistic SALE price is computed after amenities are seeded.
                seeded_price = 1

            property_obj = Property.objects.create(
                property_name=seeder.faker.catch_phrase(),
                property_description=seeder.faker.text(max_nb_chars=200),
                property_address=seeder.faker.address(),
                property_municipality=municipality,
                owner=owner,
                agent=agent,
                category=category,
                condition=condition,
                location_quality=location_quality,
                property_size=lot_size,
                building_size=building_size,
                num_bedrooms=bedrooms,
                num_bathrooms=bathrooms,
                price=seeded_price,
                type=listing_type,
                is_available_for_tour=random.choice([True, False]),
                status=random.choice(['ACTIVE', 'SOLD', 'UNDER_REVIEW'])
            )
            properties.append(property_obj)
            self.stdout.write(f'  ✓ Created Property: {property_obj.property_name}')

            # Create Property Images
            for j in range(random.randint(1, 3)):
                PropertyImage.objects.create(
                    property=property_obj,
                    image='',  # Placeholder — no actual file
                    alt_text=seeder.faker.sentence(),
                    is_primary=(j == 0)
                )

            # Create Amenities (skip LOT listings)
            if category != 'LOT':
                for j in range(random.randint(0, 3)):
                    Amenity.objects.create(
                        property=property_obj,
                        name=random.choice(['Pool', 'Garden', 'Garage', 'Gym', 'Security', 'Elevator']),
                        amenity_type=random.choice(['Basic', 'Luxury']),
                        price=random.randint(50000, 300000),
                        added_by=random.choice(all_users) if all_users else None
                    )

            if listing_type == 'SALE':
                property_obj.price = self._calculate_seeded_sale_price(property_obj)
                property_obj.save(update_fields=["price"])

        # Create Tours
        tours_created = 0
        available_properties = [p for p in properties if p.is_available_for_tour]
        if available_properties and agents and buyers:
            for i in range(min(number // 2, len(available_properties))):
                # Generate timezone-aware datetime
                future_dt = timezone.now() + timezone.timedelta(days=random.randint(1, 30))
                Tour.objects.create(
                    property=random.choice(available_properties),
                    agent=random.choice(agents),
                    buyer=random.choice(buyers),
                    tour_datetime=future_dt,
                    status=random.choice(['QUEUED', 'SCHEDULED', 'COMPLETED', 'REJECTED'])
                )
                tours_created += 1
            self.stdout.write(f'  ✓ Created {tours_created} Tours')

        # Create Sales
        sold_properties = [p for p in properties if p.status == 'SOLD']
        if sold_properties and buyers:
            for property_obj in sold_properties[:min(3, len(sold_properties))]:
                sale = Sale.objects.create(
                    property=property_obj,
                    date_sold=seeder.faker.date_this_year(),
                    final_price=property_obj.price or random.randint(1000000, 50000000),
                    buyer=random.choice(buyers),
                    approval_status='COMPLETED'
                )
                self.stdout.write(f'  ✓ Created Sale: {property_obj.property_name}')

        # Create Pending Sale Requests
        if properties and all_users:
            for i in range(min(2, len(properties))):
                PendingSaleRequest.objects.create(
                    property=random.choice(properties),
                    final_price=random.randint(1000000, 50000000),
                    proposed_buyer=random.choice(buyers) if buyers else None,
                    reason_for_review=seeder.faker.text(max_nb_chars=100),
                    status=random.choice(['PENDING', 'APPROVED', 'REJECTED']),
                    created_by=random.choice(all_users)
                )
                self.stdout.write(f'  ✓ Created Pending Sale Request')

        # =====================================================================
        # STEP 5: Assign Permissions to Groups (NOW that tables exist)
        # =====================================================================
        self.stdout.write(self.style.WARNING('\nSTEP 5: Assigning permissions to groups...'))

        # Get ContentTypes for all models
        property_ct = ContentType.objects.get_for_model(Property)
        municipality_ct = ContentType.objects.get_for_model(Municipality)
        amenity_ct = ContentType.objects.get_for_model(Amenity)
        propertyimage_ct = ContentType.objects.get_for_model(PropertyImage)
        tour_ct = ContentType.objects.get_for_model(Tour)
        sale_ct = ContentType.objects.get_for_model(Sale)
        pendingsale_ct = ContentType.objects.get_for_model(PendingSaleRequest)

        # SuperAdmin permissions — can do absolutely everything
        superadmin_permissions = Permission.objects.all()
        groups['SuperAdmin'].permissions.set(superadmin_permissions)
        self.stdout.write('  ✓ SuperAdmin group: Full permissions on ALL models and actions')

        # Admin permissions — can do everything
        admin_permissions = Permission.objects.filter(
            content_type__in=[
                property_ct, municipality_ct, amenity_ct, propertyimage_ct,
                tour_ct, sale_ct, pendingsale_ct
            ]
        )
        groups['Admin'].permissions.set(admin_permissions)
        self.stdout.write('  ✓ Admin group: Full permissions on all models')

        # Agent permissions — can view/add/update properties, tours, sales
        agent_permissions = Permission.objects.filter(
            content_type__in=[property_ct, amenity_ct, propertyimage_ct, tour_ct, sale_ct],
            codename__in=[
                'view_property', 'add_property', 'change_property',
                'view_amenity', 'add_amenity', 'change_amenity',
                'view_propertyimage', 'add_propertyimage',
                'view_tour', 'change_tour',  # no add_tour — Agents manage, not book
                'view_sale', 'add_sale',
            ]
        )
        groups['Agent'].permissions.set(agent_permissions)
        groups['Verified Agents'].permissions.set(agent_permissions)
        self.stdout.write('  ✓ Agent group: Can add/view/edit properties, manage amenities, tours, and sales')

        # Owner permissions — can view/add/update their own properties and amenities
        owner_permissions = Permission.objects.filter(
            content_type__in=[property_ct, amenity_ct, propertyimage_ct],
            codename__in=[
                'view_property', 'add_property', 'change_property',
                'view_amenity', 'add_amenity', 'change_amenity',
                'view_propertyimage', 'add_propertyimage',
            ]
        )
        groups['Owner'].permissions.set(owner_permissions)
        self.stdout.write('  ✓ Owner group: Can manage their own properties and amenities')

        # Buyer permissions — can view properties, tours, and create tour requests
        buyer_permissions = Permission.objects.filter(
            content_type__in=[property_ct, municipality_ct, amenity_ct, propertyimage_ct, tour_ct],
            codename__in=[
                'view_property', 'view_municipality', 'view_amenity', 'view_propertyimage',
                'view_tour', 'add_tour',
            ]
        )
        groups['Buyer'].permissions.set(buyer_permissions)
        self.stdout.write('  ✓ Buyer group: Can view properties and request tours')

        # =====================================================================
        # Summary
        # =====================================================================
        self.stdout.write(self.style.SUCCESS('\n' + '='*60))
        self.stdout.write(self.style.SUCCESS('SEEDING COMPLETE!'))
        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write(self.style.SUCCESS(f'\nGroups created: {len(groups)}'))
        self.stdout.write(self.style.SUCCESS(f'Users: {User.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'Municipalities: {Municipality.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'Properties: {Property.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'Amenities: {Amenity.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'Property Images: {PropertyImage.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'Tours: {Tour.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'Sales: {Sale.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'Pending Sale Requests: {PendingSaleRequest.objects.count()}'))
        self.stdout.write(self.style.SUCCESS('\nDefault password for seeded non-superadmin users: password123'))


