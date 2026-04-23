import time
from django.core.cache import cache
from rest_framework.throttling import BaseThrottle


def is_verified_creator(user):
    if not user or not user.is_authenticated:
        return False
    return user.groups.filter(name__in=["Verified Agents", "Verified Owners"]).exists()


class BaseCreatorCooldownThrottle(BaseThrottle):
    scope = "creator"
    cooldown_seconds = 0

    def applies_to_user(self, user):
        return False

    def get_cache_key(self, request):
        user = request.user
        if not user or not user.is_authenticated:
            return None
        return f"throttle:{self.scope}:user:{user.pk}"

    def allow_request(self, request, view):
        if request.method != "POST":
            return True
        user = request.user
        if not user or not user.is_authenticated:
            return True

        if not self.applies_to_user(user):
            return True

        cache_key = self.get_cache_key(request)
        if not cache_key:
            return True

        now = time.time()
        last_request = cache.get(cache_key)

        if last_request is not None:
            elapsed = now - float(last_request)
            if elapsed < self.cooldown_seconds:
                self._wait = self.cooldown_seconds - elapsed
                return False

        cache.set(cache_key, now, timeout=self.cooldown_seconds)
        self._wait = None
        return True

    def wait(self):
        return self._wait

class VerifiedAgentThrottle(BaseCreatorCooldownThrottle):
    scope = "verified_creator"
    cooldown_seconds = 5 * 60

    def applies_to_user(self, user):
        return is_verified_creator(user)


class UnverifiedAgentThrottle(BaseCreatorCooldownThrottle):
    scope = "unverified_creator"
    cooldown_seconds = 30 * 60

    def applies_to_user(self, user):
        return not is_verified_creator(user)
