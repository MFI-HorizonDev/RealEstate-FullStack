from django.db import models
from django.core.validators import MinValueValidator
from listings.models import Property
from django.contrib.auth.models import User


class Sale(models.Model):
    APPROVAL_STATUS_CHOICES = [
        ('PENDING_REVIEW', 'Pending Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('COMPLETED', 'Completed'),
    ]

    property = models.OneToOneField(Property,on_delete=models.CASCADE,related_name='sale_record')
    date_sold = models.DateField()
    final_price = models.DecimalField(max_digits=15,decimal_places=2,validators=[MinValueValidator(0)])
    buyer = models.ForeignKey(User,on_delete=models.SET_NULL,null=True,blank=True,related_name='purchases')
    approval_status = models.CharField(max_length=20, choices=APPROVAL_STATUS_CHOICES, default='COMPLETED')
    admin_notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Sale of {self.property.property_name} on {self.date_sold} for ₱{self.final_price}"


class Commission(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='commissions')
    agent = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='commissions')
    amount_calculated = models.DecimalField(max_digits=15,decimal_places=2,validators=[MinValueValidator(0)])
    commission_rate = models.DecimalField(max_digits=5,decimal_places=2,default=5.00)

    date_paid = models.DateField(auto_now_add=True)
    is_paid = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.amount_calculated and self.sale and self.commission_rate:
            self.amount_calculated = (self.sale.final_price * self.commission_rate) / 100
        super().save(*args, **kwargs)

    def __str__(self):
        agent_name = self.agent.username if self.agent else "Sino ka?"
        return f"Commission for {agent_name} on Sale ID {self.sale.id}: ₱{self.amount_calculated}"


class PendingSaleRequest(models.Model):
    REQUEST_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]

    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='pending_sale_requests')
    final_price = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(0)])
    proposed_buyer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='proposed_purchases')
    reason_for_review = models.TextField(help_text="Explanation of why this sale requires admin review")
    status = models.CharField(max_length=20, choices=REQUEST_STATUS_CHOICES, default='PENDING')
    admin_notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_sale_requests')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Pending Sale Request for {self.property.property_name} - {self.status}"