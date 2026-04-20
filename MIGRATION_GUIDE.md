# Migration Instructions

## Step 1: Apply Django Migrations

After the code changes, you need to create and apply migrations for the new `UserProfile` model.

```bash
# Navigate to backend directory
cd back

# Create migration files for the new model
python manage.py makemigrations

# Apply migrations to the database
python manage.py migrate
```

## Step 2: Create User Groups

The permission system relies on user groups. Create them using the Django shell:

```bash
# Open Django shell
python manage.py shell
```

Then run these commands:

```python
from django.contrib.auth.models import Group, Permission

# Create the groups
groups = ['Super Admin', 'Admin', 'Agent', 'Owner', 'Buyer']

for group_name in groups:
    group, created = Group.objects.get_or_create(name=group_name)
    if created:
        print(f"Created group: {group_name}")
    else:
        print(f"Group already exists: {group_name}")

# Exit the shell
exit()
```

## Step 3: Create a Super Admin User (Optional)

If you don't have a super admin user yet:

```bash
python manage.py createsuperuser
```

Follow the prompts to create a super admin account.

## Step 4: Verify Migrations

Check that all migrations are applied:

```bash
python manage.py showmigrations
```

All migrations should show `[X]` indicating they've been applied.

## Step 5: Test the API

Start the development server and test the endpoints:

```bash
python manage.py runserver
```

Test a simple endpoint:
```bash
curl http://localhost:8000/api/health/
```

You should get a response like: `{"status": "ok", "message": "Backend is running"}`

## Step 6: Create or Assign User Groups

To assign users to groups, you can use the Django admin or the shell:

```python
from django.contrib.auth.models import User, Group

# Get a user
user = User.objects.get(username='john')

# Get the group
agent_group = Group.objects.get(name='Agent')

# Add user to group
user.groups.add(agent_group)
```

Or use the Django admin at: `http://localhost:8000/admin/`

## Troubleshooting

### Migration Errors
If you see migration errors, try:
```bash
# Check for conflicts
python manage.py makemigrations --check

# Reset migrations (WARNING: destructive)
# Only for development!
python manage.py migrate listings zero
python manage.py migrate
```

### Permission Errors
If users can't access endpoints:
1. Verify they're in the correct group
2. Check their `is_superuser` status
3. Review permission classes in `core/permissions.py`

### Database Issues
If you have a corrupted database:
```bash
# Backup your data first!

# Delete the database
rm db.sqlite3

# Re-create and migrate
python manage.py migrate
```

## Frontend Setup

The frontend requires no additional setup beyond the existing environment.

Just ensure all the new files are in place:
- `services/api/useProfile.js`
- `services/permissions.js`
- `components/PermissionGuard.jsx`
- Updated `services/api/useAuth.js`
- Updated `hoc/withAuth.jsx`
- Updated `pages/Profile.jsx`
- Updated `services/api/useProperties.js`

## Verification Checklist

- [ ] Migrations created with `makemigrations`
- [ ] Migrations applied with `migrate`
- [ ] User groups created (Super Admin, Admin, Agent, Owner, Buyer)
- [ ] Super admin user created
- [ ] Backend server runs without errors
- [ ] Health endpoint returns OK status
- [ ] Can login and get JWT tokens
- [ ] Can fetch `/api/me/` endpoint
- [ ] Can upload profile images
- [ ] Frontend components imported and working
