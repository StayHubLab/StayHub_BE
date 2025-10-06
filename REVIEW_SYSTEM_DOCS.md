# 📝 Review System Documentation

## 🎯 Overview
Review system cho phép người thuê (renter) đánh giá **phòng trọ** và **chủ trọ** một cách độc lập.

### Key Features:
- ✅ **Đánh giá phòng trọ** - Review cho từng phòng cụ thể
- ✅ **Đánh giá chủ trọ** - Review trực tiếp cho landlord (chỉ 1 lần cho mỗi chủ)
- ✅ **Ngăn duplicate** - Mỗi người chỉ review 1 lần cho mỗi phòng/chủ trọ
- ✅ **Verification** - Kiểm tra có hợp đồng thuê thực sự
- ✅ **Statistics** - Tính trung bình rating và tổng số reviews

## 🏗️ Database Schema

### Review Model
```javascript
{
  targetType: 'room' | 'landlord',  // Loại review
  roomId: ObjectId,                 // Required nếu targetType = 'room'
  landlordId: ObjectId,             // Always required
  renterId: ObjectId,               // Người viết review
  rating: Number (1-5),             // Điểm đánh giá
  comment: String (max 500 chars),  // Nhận xét
  contractId: ObjectId,             // Optional - để verify
  isVerifiedRental: Boolean,        // Có hợp đồng thực không
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes
```javascript
// Unique constraint: 1 renter chỉ review 1 room một lần
{ roomId: 1, renterId: 1 } - unique

// Queries
{ landlordId: 1, renterId: 1, targetType: 1 }
{ landlordId: 1, targetType: 1 }
{ renterId: 1 }
{ rating: 1 }
```

## 📡 API Endpoints

### 1. Tạo Review cho Phòng Trọ
```http
POST /api/reviews/room
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "roomId": "670f1234...",
  "rating": 5,
  "comment": "Phòng rất đẹp, sạch sẽ",
  "contractId": "670f5678..."  // Optional
}

Response (201):
{
  "success": true,
  "message": "Room review created successfully",
  "data": {
    "_id": "670f9abc...",
    "targetType": "room",
    "roomId": {
      "_id": "670f1234...",
      "name": "Phòng 101",
      "images": [...],
      "price": { "rent": 3000000 }
    },
    "landlordId": "670fdef...",
    "renterId": {
      "_id": "670f5678...",
      "name": "Nguyễn Văn A",
      "avatar": "..."
    },
    "rating": 5,
    "comment": "Phòng rất đẹp, sạch sẽ",
    "isVerifiedRental": true,
    "createdAt": "2025-10-04T..."
  }
}

Errors:
- 400: Missing roomId or rating
- 409: Already reviewed this room
- 404: Room not found
```

### 2. Tạo Review cho Chủ Trọ
```http
POST /api/reviews/landlord
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "landlordId": "670fdef...",
  "rating": 4,
  "comment": "Chủ nhiệt tình, hỗ trợ tốt"
}

Response (201):
{
  "success": true,
  "message": "Landlord review created successfully",
  "data": {
    "_id": "670fabc...",
    "targetType": "landlord",
    "landlordId": {
      "_id": "670fdef...",
      "name": "Chủ Trọ X",
      "avatar": "..."
    },
    "renterId": {
      "_id": "670f5678...",
      "name": "Nguyễn Văn A"
    },
    "rating": 4,
    "comment": "Chủ nhiệt tình, hỗ trợ tốt",
    "isVerifiedRental": true,
    "createdAt": "2025-10-04T..."
  }
}

Errors:
- 400: Missing landlordId or rating
- 403: Not eligible (chưa từng thuê phòng của chủ này)
- 409: Already reviewed this landlord
- 404: Landlord not found
```

### 3. Lấy Reviews của Phòng Trọ
```http
GET /api/reviews/room/:roomId?page=1&limit=10&sort=-createdAt

Response (200):
{
  "success": true,
  "message": "Room reviews retrieved successfully",
  "data": {
    "reviews": [
      {
        "_id": "670f9abc...",
        "renterId": {
          "name": "Nguyễn Văn A",
          "avatar": "..."
        },
        "rating": 5,
        "comment": "Phòng đẹp",
        "createdAt": "2025-10-04T..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    },
    "statistics": {
      "averageRating": 4.5,
      "totalReviews": 25
    }
  }
}
```

### 4. Lấy Reviews của Chủ Trọ
```http
GET /api/reviews/landlord/:landlordId?page=1&limit=10

Response (200):
{
  "success": true,
  "message": "Landlord reviews retrieved successfully",
  "data": {
    "reviews": [...],
    "pagination": {...},
    "statistics": {
      "averageRating": 4.2,
      "totalReviews": 15
    }
  }
}
```

### 5. Lấy Thống Kê Đầy Đủ của Chủ Trọ
```http
GET /api/reviews/landlord/:landlordId/stats

Response (200):
{
  "success": true,
  "message": "Landlord statistics retrieved successfully",
  "data": {
    "landlordReviews": {
      "averageRating": 4.2,
      "totalReviews": 15
    },
    "roomReviews": {
      "averageRating": 4.5,
      "totalReviews": 45
    },
    "overall": {
      "totalReviews": 60,
      "averageRating": 4.35
    }
  }
}
```

### 6. Lấy Reviews của User Hiện Tại
```http
GET /api/reviews/my-reviews
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Your reviews retrieved successfully",
  "data": [
    {
      "_id": "...",
      "targetType": "room",
      "roomId": {
        "name": "Phòng 101",
        "images": [...]
      },
      "landlordId": {...},
      "rating": 5,
      "comment": "..."
    },
    {
      "_id": "...",
      "targetType": "landlord",
      "landlordId": {
        "name": "Chủ X"
      },
      "rating": 4,
      "comment": "..."
    }
  ]
}
```

### 7. Cập Nhật Review
```http
PUT /api/reviews/:reviewId
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "rating": 4,
  "comment": "Updated comment"
}

Response (200):
{
  "success": true,
  "message": "Review updated successfully",
  "data": {...}
}

Errors:
- 403: Unauthorized (không phải review của mình)
- 404: Review not found
```

### 8. Xóa Review
```http
DELETE /api/reviews/:reviewId
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Review deleted successfully"
}

Errors:
- 403: Unauthorized
- 404: Review not found
```

## 🎯 Use Cases

### Case 1: Renter thuê 2 phòng của cùng 1 chủ trọ

**Scenario:**
- User A thuê **Phòng 101** của Chủ X
- User A thuê **Phòng 202** của Chủ X

**Reviews có thể tạo:**
1. ✅ Review cho **Phòng 101** (targetType: 'room')
2. ✅ Review cho **Phòng 202** (targetType: 'room')  
3. ✅ Review cho **Chủ X** (targetType: 'landlord') - **CHỈ 1 LẦN**

**Logic:**
- Mỗi phòng được review riêng → 2 reviews
- Chủ trọ chỉ review 1 lần → 1 review
- **Total: 3 reviews**

### Case 2: Prevent Duplicate Reviews

**Database Constraints:**
```javascript
// Unique index prevents duplicate room reviews
{ roomId: "670f1234", renterId: "670f5678" } // ✅ First review OK
{ roomId: "670f1234", renterId: "670f5678" } // ❌ Error: Already exists

// Logic check prevents duplicate landlord reviews
hasReviewedLandlord(renterId, landlordId) // Returns true → Prevent
```

### Case 3: Verification Flow

**With Contract:**
```javascript
// User has contract → isVerifiedRental: true
POST /api/reviews/room
{
  "roomId": "...",
  "rating": 5,
  "contractId": "670f5678..."  // ✅ Contract verified
}
→ isVerifiedRental: true
```

**Without Contract:**
```javascript
// No contract provided
POST /api/reviews/room
{
  "roomId": "...",
  "rating": 5
}
→ isVerifiedRental: false
```

## 🔒 Business Rules

### 1. Review cho Phòng
- ✅ Phải có `roomId`
- ✅ Tự động get `landlordId` từ room → building → owner
- ✅ Chỉ được review mỗi phòng 1 lần
- ✅ Optional: Verify với `contractId`

### 2. Review cho Chủ Trọ
- ✅ Phải có `landlordId`
- ✅ KHÔNG có `roomId`
- ✅ Chỉ được review mỗi chủ 1 lần
- ✅ **Must verify**: Phải có ít nhất 1 contract với chủ này (active/completed)

### 3. Permissions
- **Create**: Chỉ renter đã thuê mới được review
- **Read**: Public - ai cũng xem được
- **Update**: Chỉ người tạo review
- **Delete**: Chỉ người tạo review

## 💡 Frontend Integration

### Display Room Reviews
```javascript
// Get room reviews with statistics
const response = await fetch(`/api/reviews/room/${roomId}`);
const { data } = await response.json();

console.log(data.statistics.averageRating); // 4.5
console.log(data.statistics.totalReviews);  // 25
data.reviews.map(review => {
  // Display each review
});
```

### Create Room Review
```javascript
const createRoomReview = async (roomId, rating, comment) => {
  const response = await fetch('/api/reviews/room', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ roomId, rating, comment })
  });
  
  if (!response.ok) {
    const error = await response.json();
    if (error.message === 'You have already reviewed this room') {
      // Show message: Bạn đã đánh giá phòng này rồi
    }
  }
};
```

### Create Landlord Review
```javascript
const createLandlordReview = async (landlordId, rating, comment) => {
  const response = await fetch('/api/reviews/landlord', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ landlordId, rating, comment })
  });
  
  if (!response.ok) {
    const error = await response.json();
    if (error.message === 'You have already reviewed this landlord') {
      // Show: Bạn đã đánh giá chủ trọ này rồi
    } else if (error.message.includes('not eligible')) {
      // Show: Bạn chưa thuê phòng của chủ này
    }
  }
};
```

### Display Landlord Profile with Stats
```javascript
// Get complete stats for landlord profile page
const response = await fetch(`/api/reviews/landlord/${landlordId}/stats`);
const { data } = await response.json();

console.log('Landlord Reviews:', data.landlordReviews);
console.log('Room Reviews:', data.roomReviews);
console.log('Overall Rating:', data.overall.averageRating);
```

## 🧪 Testing Examples

### Test Case 1: Create Room Review
```bash
# Login first
POST /api/auth/login
{ "email": "renter@example.com", "password": "..." }
→ Get token

# Create review
POST /api/reviews/room
Authorization: Bearer <token>
{
  "roomId": "670f1234...",
  "rating": 5,
  "comment": "Great room!"
}
→ 201 Created

# Try duplicate
POST /api/reviews/room (same roomId)
→ 409 Conflict: Already reviewed
```

### Test Case 2: Create Landlord Review
```bash
# Create landlord review
POST /api/reviews/landlord
Authorization: Bearer <token>
{
  "landlordId": "670fdef...",
  "rating": 4,
  "comment": "Good landlord"
}
→ 201 Created

# Try duplicate
POST /api/reviews/landlord (same landlordId)
→ 409 Conflict: Already reviewed
```

### Test Case 3: Get Statistics
```bash
# Get room reviews
GET /api/reviews/room/670f1234...
→ Returns reviews + averageRating

# Get landlord stats
GET /api/reviews/landlord/670fdef.../stats
→ Returns comprehensive statistics
```

---

## 📊 Summary

| Feature | Room Review | Landlord Review |
|---------|------------|-----------------|
| **targetType** | 'room' | 'landlord' |
| **roomId** | Required | Not allowed |
| **landlordId** | Auto-filled | Required |
| **Frequency** | 1 per room | 1 per landlord |
| **Verification** | Optional (contractId) | Automatic (check contract) |
| **Who can review** | Any renter | Only renters with contract |

**Perfect solution cho yêu cầu: 1 model, 2 loại review, ngăn duplicate! 🎯**