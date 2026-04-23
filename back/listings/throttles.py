from rest_framework.throttling import UserRateThrottle


def is_verified_creator(user):
    if not user or not user.is_authenticated:
        return False
    return user.groups.filter(name__in=["Verified Agents", "Verified Owners"]).exists()


class VerifiedAgentThrottle(UserRateThrottle):
    scope = "verified_creator"
    rate = "1/5m"

    def allow_request(self, request, view):
        if request.method != "POST":
            return True
        if not request.user or not request.user.is_authenticated:
            return True
        if not is_verified_creator(request.user):
            return True  # not their throttle — let UnverifiedAgentThrottle handle
        return super().allow_request(request, view)


class UnverifiedAgentThrottle(UserRateThrottle):
    scope = "unverified_creator"
    rate = "1/30m"

    def allow_request(self, request, view):
        if request.method != "POST":
            return True
        if not request.user or not request.user.is_authenticated:
            return True
        if is_verified_creator(request.user):
            return True  # not their throttle — let VerifiedAgentThrottle handle
        return super().allow_request(request, view)
