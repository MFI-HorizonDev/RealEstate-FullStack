from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class RegisterRateThrottle(AnonRateThrottle):
    scope = "register"


class LoginRateThrottle(AnonRateThrottle):
    scope = "login"


class TourWriteThrottle(UserRateThrottle):
    scope = "tour_write"


class SaleWriteThrottle(UserRateThrottle):
    scope = "sale_write"


class PendingSaleWriteThrottle(UserRateThrottle):
    scope = "pending_sale_write"
