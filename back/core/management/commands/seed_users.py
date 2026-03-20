from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django_seed import Seed


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

        seeder.add_entity (User, number,{
            'username': lambda x: seeder.faker.unique.user_name(),
            'email': lambda x: seeder.faker.unique.email(),
            'first_name': lambda x: seeder.faker.first_name(),
            'last_name': lambda x: seeder.faker.last_name()
        })

        seeder.execute()

        for user in User.objects.all():
            if not user.has_usable_password():
                user.set_password('password123')
                user.save()

        self.stdout.write(self.style.SUCCESS(f'Successfully created {number} users'))


