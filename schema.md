# Database Schema — Glow Luxury Skincare

## MongoDB Collections

### 1. Users Collection
```
Field         | Type     | Description
--------------|----------|-----------------------------
_id           | ObjectId | Primary key
name          | String   | Full name
email         | String   | Unique email address
password      | String   | bcrypt-hashed password
role          | String   | 'user' | 'admin'
avatar        | String   | Profile image URL
wishlist[]    | ObjectId | References Products
address       | Object   | {street, city, state, zip, country}
createdAt     | Date     | Timestamp
updatedAt     | Date     | Timestamp
```

### 2. Products Collection
```
Field          | Type     | Description
---------------|----------|-----------------------------
_id            | ObjectId | Primary key
name           | String   | Product name
slug           | String   | URL-friendly name (unique)
description    | String   | Product description
category       | String   | 'Facewash'|'Sunblock'|'Serums'|'Creams'
price          | Number   | Current price
originalPrice  | Number   | Original price (nullable)
image          | String   | Main image path
images[]       | String   | Additional images
rating         | Number   | Average rating (0-5)
numReviews     | Number   | Review count
countInStock   | Number   | Available stock
isFeatured     | Boolean  | Show on homepage slider
ingredients    | String   | Key ingredients
howToUse       | String   | Usage instructions
skinType       | String   | Suitable skin types
createdAt      | Date     | Timestamp
updatedAt      | Date     | Timestamp
```

### 3. Orders Collection
```
Field            | Type     | Description
-----------------|----------|-----------------------------
_id              | ObjectId | Primary key
user             | ObjectId | References User
items[]          | Array    | Array of:
  .product       | ObjectId | References Product
  .name          | String   | Snapshot name
  .image         | String   | Snapshot image
  .price         | Number   | Snapshot price
  .quantity      | Number   | Quantity ordered
shippingAddress  | Object   | {fullName,street,city,state,zip,country}
paymentMethod    | String   | 'Credit Card'
itemsPrice       | Number   | Subtotal
shippingPrice    | Number   | Shipping cost
totalPrice       | Number   | Total
isPaid           | Boolean  | Payment status
paidAt           | Date     | Payment timestamp
isDelivered      | Boolean  | Delivery status
deliveredAt      | Date     | Delivery timestamp
status           | String   | 'pending'|'processing'|'shipped'|'delivered'|'cancelled'
createdAt        | Date     | Timestamp
updatedAt        | Date     | Timestamp
```

## Indexes
- `users.email` — unique index
- `products.slug` — unique index
- `products.category` — for filtered queries
- `products.isFeatured` — for featured slider
- `orders.user` — for user order history
- `orders.status` — for admin filtering
