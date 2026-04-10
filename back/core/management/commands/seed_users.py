from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from django_seed import Seed
import random

from listings.models import Municipality, Property, Amenity
from tours.models import Tour
from deals.models import Sale, Commission, PendingSaleRequest

User = get_user_model()

class Command (BaseCommand):

    def add_arguments(self, parser):
        parser.add_argument (
            '--number',
            type=int,
            default=10
        )

    def handle(self, *args, **options):
        number = options['number']
        seeder = Seed.seeder()

        # ── 1. Users ──────────────────────────────────────────────────────────
        seeder.add_entity (User, number, {
            'username': lambda x: seeder.faker.unique.user_name(),
            'email': lambda x: seeder.faker.unique.email(),
            'first_name': lambda x: seeder.faker.first_name(),
            'last_name': lambda x: seeder.faker.last_name()
        })

        # ── 2. Municipalities ─────────────────────────────────────────────────
        seeder.add_entity (Municipality, number, {
            'municipality_name': lambda x: seeder.faker.unique.city(),
            'price_per_sqm': lambda x: random.randint(5000, 80000),
        })

        seeder.execute()

        for user in User.objects.all():
            if not user.has_usable_password():
                user.set_password('password123')
                user.save()

        self.stdout.write(self.style.SUCCESS(f'Successfully created {number} users'))
        self.stdout.write(self.style.SUCCESS(f'Successfully created {number} municipalities'))

        # ── 3. Properties ─────────────────────────────────────────────────────
        users = list(User.objects.all())
        municipalities = list(Municipality.objects.all())
        listing_types = ['SALE', 'RENT', 'LEASE', 'FORECLOSURE']

        seeder2 = Seed.seeder()
        seeder2.add_entity (Property, number, {
            'property_name': lambda x: seeder2.faker.street_name() + ' Property',
            'property_description': lambda x: seeder2.faker.paragraph(),
            'property_address': lambda x: seeder2.faker.address(),
            'property_municipality': lambda x: random.choice(municipalities),
            'owner': lambda x: random.choice(users),
            'agent': lambda x: random.choice(users),
            'property_size': lambda x: random.randint(30, 500),
            'num_bedrooms': lambda x: random.randint(0, 6),
            'num_bathrooms': lambda x: random.randint(1, 4),
            'type': lambda x: random.choice(listing_types),
            'is_available_for_tour': lambda x: seeder2.faker.boolean(),
            'status': lambda x: 'ACTIVE',
            'price': lambda x: None,
        })
        seeder2.execute()

        self.stdout.write(self.style.SUCCESS(f'Successfully created {number} properties'))

        # ── 4. Amenities ──────────────────────────────────────────────────────
        properties = list(Property.objects.all())
        amenity_names = ['Pool', 'Garage', 'Garden', 'Gym', 'CCTV', 'Solar Panels', 'Balcony', 'Elevator']
        amenity_count = 0

        seeder3 = Seed.seeder()
        for prop in properties:
            for name in random.sample(amenity_names, k=random.randint(1, 4)):
                a_type = random.choice(['Basic', 'Luxury'])
                max_price = 100000 if a_type == 'Basic' else 250000
                seeder3.add_entity (Amenity, 1, {
                    'property': lambda x, p=prop: p,
                    'name': lambda x, n=name: n,
                    'amenity_type': lambda x, t=a_type: t,
                    'price': lambda x, mp=max_price: random.randint(10000, mp),
                    'added_by': lambda x: random.choice(users),
                })
                amenity_count += 1
        seeder3.execute()

        self.stdout.write(self.style.SUCCESS(f'Successfully created {amenity_count} amenities'))

        # ── 5. Tours (overlap-safe) ───────────────────────────────────────────
        statuses = ['Scheduled', 'Completed', 'Cancelled']
        used_slots = {}
        base_time = timezone.now().replace(minute=0, second=0, microsecond=0) + timedelta(days=1)
        tours = []
        attempts = 0

        def slot_free(key, start, end):
            for (s, e) in used_slots.get(key, []):
                if not (end <= s or start >= e):
                    return False
            return True

        def mark_slot(key, start, end):
            used_slots.setdefault(key, []).append((start, end))

        while len(tours) < number and attempts < number * 10:
            attempts += 1
            prop = random.choice(properties)
            agent = random.choice(users)
            buyer = random.choice(users)
            start = base_time + timedelta(hours=random.randint(0, 200))
            end = start + timedelta(hours=random.randint(1, 3))

            if not slot_free(f'prop_{prop.id}', start, end):
                continue
            if not slot_free(f'agent_{agent.id}', start, end):
                continue

            try:
                tour = Tour(
                    property=prop,
                    agent=agent,
                    buyer=buyer,
                    start_time=start,
                    end_time=end,
                    status=random.choice(statuses),
                )
                tour.full_clean()
                tour.save()
                mark_slot(f'prop_{prop.id}', start, end)
                mark_slot(f'agent_{agent.id}', start, end)
                prop.property_tours.add(tour)
                tours.append(tour)
            except Exception:
                continue

        self.stdout.write(self.style.SUCCESS(f'Successfully created {len(tours)} tours'))

        # ── 6. Sales ──────────────────────────────────────────────────────────
        sold_ids = set()
        sales = []
        sale_count = min(number, len(properties))

        for prop in random.sample(properties, k=sale_count):
            sale = Sale.objects.create(
                property=prop,
                date_sold=seeder.faker.date_between(start_date='-1y', end_date='today'),
                final_price=random.randint(500000, 10000000),
                buyer=random.choice(users),
                approval_status=random.choice(['PENDING_REVIEW', 'APPROVED', 'COMPLETED']),
                admin_notes=seeder.faker.sentence() if seeder.faker.boolean() else '',
            )
            sold_ids.add(prop.id)
            sales.append(sale)

        self.stdout.write(self.style.SUCCESS(f'Successfully created {len(sales)} sales'))

        # ── 7. Commissions ────────────────────────────────────────────────────
        for sale in sales:
            rate = round(random.uniform(3, 8), 2)
            Commission.objects.create(
                sale=sale,
                agent=random.choice(users),
                commission_rate=rate,
                amount_calculated=(sale.final_price * rate) / 100,
                is_paid=seeder.faker.boolean(),
            )

        self.stdout.write(self.style.SUCCESS(f'Successfully created {len(sales)} commissions'))

        # ── 8. Pending Sale Requests ──────────────────────────────────────────
        pending_props = [p for p in properties if p.id not in sold_ids]
        psr_count = min(number, len(pending_props))

        for prop in random.sample(pending_props, k=psr_count):
            PendingSaleRequest.objects.create(
                property=prop,
                final_price=random.randint(500000, 10000000),
                proposed_buyer=random.choice(users),
                reason_for_review=seeder.faker.paragraph(),
                status=random.choice(['PENDING', 'APPROVED', 'REJECTED']),
                admin_notes=seeder.faker.sentence() if seeder.faker.boolean() else '',
                created_by=random.choice(users),
            )

        self.stdout.write(self.style.SUCCESS(f'Successfully created {psr_count} pending sale requests'))
        self.stdout.write(self.style.SUCCESS('All models seeded successfully.'))
