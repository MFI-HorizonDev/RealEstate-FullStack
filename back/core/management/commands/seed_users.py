from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType
from django_seed import Seed
from django.utils import timezone
import random

from listings.models import Municipality, Property, Amenity, PropertyImage
from tours.models import Tour
from deals.models import Sale, Commission, PendingSaleRequest


class Command(BaseCommand):
    help = 'Seed database: Groups → Users (with group join) → Tables → Permissions'

    def add_arguments(self, parser):
        parser.add_argument(
            '--number',
            type=int,
            default=10
        )

    def handle(self, *args, **options):
        number = options['number']
        seeder = Seed.seeder()

        # =====================================================================
        # STEP 1: Create Groups (NO permissions yet — tables don't exist)
        # =====================================================================
        self.stdout.write(self.style.WARNING('STEP 1: Creating groups...'))

        group_names = ['SuperAdmin', 'Admin', 'Agent', 'Owner', 'Buyer']
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
            self.stdout.write(self.style.SUCCESS(f'  ✓ Created superuser: {superuser_username} (password: {superuser_password})'))
        else:
            superuser.groups.add(groups['SuperAdmin'])
            self.stdout.write(self.style.SUCCESS(f'  • Superuser already exists: {superuser_username}'))

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
                user.save()
            user.groups.add(groups['Agent'])
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
        for i in range(max(3, number // 3)):
            municipality, created = Municipality.objects.get_or_create(
                municipality_name=seeder.faker.unique.city(),
                defaults={
                    'price_per_sqm': random.randint(5000, 80000)
                }
            )
            municipalities.append(municipality)
            if created:
                self.stdout.write(f'  ✓ Created Municipality: {municipality.municipality_name}')

        # Get all users for assignments
        owners = list(User.objects.filter(groups__name='Owner'))
        agents = list(User.objects.filter(groups__name='Agent'))
        buyers = list(User.objects.filter(groups__name='Buyer'))
        all_users = list(User.objects.all())

        # Create Properties
        properties = []
        for i in range(number):
            owner = random.choice(owners) if owners else None
            agent = random.choice(agents) if agents else None
            municipality = random.choice(municipalities)

            property_obj = Property.objects.create(
                property_name=seeder.faker.catch_phrase(),
                property_description=seeder.faker.text(max_nb_chars=200),
                property_address=seeder.faker.address(),
                property_municipality=municipality,
                owner=owner,
                agent=agent,
                property_size=random.randint(50, 500),
                num_bedrooms=random.randint(1, 5),
                num_bathrooms=random.randint(1, 3),
                price=random.randint(1000000, 50000000),
                type=random.choice(['SALE', 'RENT', 'LEASE', 'FORECLOSURE']),
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

            # Create Amenities
            for j in range(random.randint(0, 3)):
                Amenity.objects.create(
                    property=property_obj,
                    name=random.choice(['Pool', 'Garden', 'Garage', 'Gym', 'Security', 'Elevator']),
                    amenity_type=random.choice(['Basic', 'Luxury']),
                    price=random.randint(50000, 300000),
                    added_by=random.choice(all_users) if all_users else None
                )

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

                # Create Commission for the sale
                if property_obj.agent:
                    Commission.objects.create(
                        sale=sale,
                        agent=property_obj.agent,
                        amount_calculated=sale.final_price * 0.05,
                        commission_rate=5.00,
                        is_paid=random.choice([True, False])
                    )

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
        commission_ct = ContentType.objects.get_for_model(Commission)
        pendingsale_ct = ContentType.objects.get_for_model(PendingSaleRequest)

        # SuperAdmin permissions — can do absolutely everything
        superadmin_permissions = Permission.objects.all()
        groups['SuperAdmin'].permissions.set(superadmin_permissions)
        self.stdout.write('  ✓ SuperAdmin group: Full permissions on ALL models and actions')

        # Admin permissions — can do everything
        admin_permissions = Permission.objects.filter(
            content_type__in=[
                property_ct, municipality_ct, amenity_ct, propertyimage_ct,
                tour_ct, sale_ct, commission_ct, pendingsale_ct
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
                'view_tour', 'add_tour', 'change_tour',
                'view_sale', 'add_sale',
            ]
        )
        groups['Agent'].permissions.set(agent_permissions)
        self.stdout.write('  ✓ Agent group: Can manage properties, amenities, tours, and sales')

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
        self.stdout.write(self.style.SUCCESS(f'Commissions: {Commission.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'Pending Sale Requests: {PendingSaleRequest.objects.count()}'))
        self.stdout.write(self.style.SUCCESS('\nDefault password for all users: password123'))


