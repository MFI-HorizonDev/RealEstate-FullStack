**Real Estate Listings**

**Overview**  
This project is a high-security real estate listing platform that balances ease of navigation with robust anti-fraud controls. Its core functionality is driven by a Dynamic Pricing Engine that calculates listing value based on Municipality data, Amenities (with caps to prevent price stacking), and a 1-month market buffer against griefing. Security is managed by enforcing Tiered Permissions (including Guest browsing and Verified User tour booking), uses Tiered Rate Limiting to prevent spam, and employs Business Logic Flagging to automatically send suspiciously priced listings for manual review, ensuring data integrity across all transactions.

**Key Features**  
**Dynamic Price Valuation**: The Price is only partially input by the agent; it is calculated based on four weighted factors: price\_per\_sqm (Municipality data), Amenities (categorized by Basic/Luxury), Subdivision status, and the 1-month market buffer (anti-griefing control).

**Smart Tour Booking**: User requests a Tour based on the Property. The system verifies User status, cross-checks the Agent's and Property's schedules, and manages the queue/confirmation process.

**Security & Fraud Control**: Security is an active entity that enforces: Permissions (Agent/Admin/User/Guest), Input Sanitization (XSS/Link check), and secure password storage (for user passwords).

**Business Logic Flagging**: A core anti-fraud mechanism that automatically Flags a new listing for Admin review if its calculated Price is suspiciously high, specifically targeting Amenity Price Stacking.

**Unauthenticated (Guest) Access**: Allows unauthenticated users (Guests) to browse and view all verified Properties. Access is strictly Read-Only, preventing any interactive functions like Tour Booking or saving favorites.

**Tiered Rate Limiting**: Security enforces different cooldown periods on listing creation. For instance, a Verified Agent may have a 5-minute cooldown, while an Unverified Agent is subject to a 30-minute cooldown to mitigate DoS and spam.

# **Backend**

**Relationships** 

**Agent (One-to-Many) Property**

A single Agent can own/manage many Properties.

**Agent (One-to-Many) Tours**

An Agent is responsible for all Tours booked for their properties.

**Property (Many-to-Many) Amenities**

A flexible relationship where features impact the final Price.

**Property (Many-to-One) Municipality**

Multiple properties are defined by one market region.

**Entities**

**Property \-** The core listing object. 

 Address  
 Municipality\_FK  
 Agent\_FK,  
 IsSold (Boolean)  
 price\_status (Fixed/Negotiable)  
 Price (Int)	

**Price \-** The calculated value according to different factors.

Sqm\_rate  
Amenity\_stack\_value  
Market\_buffer\_value  
in\_subdivision (Boolean).

**Agent \-** The professional user role. Verification and Certifications are critical inputs for Security's Rate Limiting logic.

User\_FK  
Verification (Boolean)  
Properties\_handled  
availability\_schedule

**User \-** The client role. Handles both authenticated access and the Guest (unauthenticated) state. Verification gates access to sensitive functions.

email, Verification (Boolean)  
Password (hashed/encrypted)  
is\_authenticated (Boolean \- determines Guest state)

**Amenities \-** Features that influence value. Luxury items are subject to a price\_impact\_cap to avoid artificial overpricing.

Name  
type (Basic/Luxury)  
Price\_impact\_cap  
agent\_added\_price

**Municipality \-** Provides the base geographic market rate for price calculation.

Name  
Average\_sqm\_price  
recent\_sales\_data

**IsSold \-** Tracks the transaction history, providing data for the Price entity's recent\_sales\_data.

Date\_sold  
final\_price

**Tour**  
Property\_FK  
Agent\_FK  
User\_FK  
Date\_time  
status (Queued/Scheduled/Completed)

**Flow**  
**A. Agent View Flow (Listing Creation)**

1. Log In: Agent attempts authentication. Security verifies credentials using Django's secure password hashing.  
2. Listing Request: Security checks Rate Limiting logic (Cooldowns) based on the Agent's Verification status.  
3. Data Submission: Agent submits property details and amenities. Security performs Sanitization (removing malicious links/scripts).  
4. Price Calculation: System calculates the final Price using all four factor inputs (Municipality, Amenities with Caps, etc.).  
5. Security Business Check: Security runs the Flagging logic. IF Price is too high, Property is created with Verification \= Pending Review.  
6. View Current Listings: Agent views their portfolio, including listings awaiting verification.  
7. Tour Management: Agent views current scheduled tours and addresses queued tours (requests pending confirmation).

### **B. User View Flow (Browsing & Tour Booking)**

1. Access Site (Guest or Logged In): User attempts to access the platform.  
2. View Listings: Guest (unauthenticated) or User (authenticated) views all Properties where Verification \= True. Security grants Read-Only access to Guests.  
3. Book Tour: Guest selects a property and attempts to book a Tour.  
4. Authentication Gate: IF User is Guest, the system denies the request and prompts them to Log In or Sign Up.  
5. Verification Check (If Logged In): System checks if the authenticated User Verification is True.  
6. Availability Check: System cross-references the requested time against the Agent's and Property's availability schedules.  
7. Tour Creation: If all checks pass, a new Tour object is created with a Queued status, and the Agent is notified for final acceptance.

# **Frontend**

**Pages**