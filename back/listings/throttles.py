from rest_framework.throttling import UserRateThrottle


class VerifiedAgentThrottle(UserRateThrottle):
    rate = "1/5m"

    def allow_request(self, request, view):
        if request.method != "POST":
            return True

        user = request.user
        if not user or not user.is_authenticated:
            return True

        is_verified = user.groups.filter(name="Verified Agents").exists()
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

        is_verified = user.groups.filter(name="Verified Agents").exists()
        if is_verified:
            return True

        return super().allow_request(request, view)

