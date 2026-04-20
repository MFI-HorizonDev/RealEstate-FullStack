from rest_framework.throttling import UserRateThrottle


def is_verified_creator(user):
    if not user or not user.is_authenticated:
        return False
    return user.groups.filter(name__in=["Verified Agents", "Verified Owners"]).exists()


class VerifiedAgentThrottle(UserRateThrottle):
    rate = "1/5m"

    def allow_request(self, request, view):
        if request.method != "POST":
            return True

        user = request.user
        if not user or not user.is_authenticated:
            return True

        is_verified = is_verified_creator(user)
        if not is_verified:
            return True

        return super().allow_request(request, view)


class UnverifiedAgentThrottle(UserRateThrottle):
    rate = "1/30m"

    def allow_request(self, request, view):
        if request.method != "POST":
            return True

        user = request.user
        if not user or not user.is_authenticated:
            return True

        is_verified = is_verified_creator(user)
        if is_verified:
            return True

        return super().allow_request(request, view)

