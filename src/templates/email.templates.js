/**
 * @fileoverview Email Templates - Contains all email templates used in the application
 * @created 2025-05-31
 * @file email.templates.js
 * @description This file defines all email templates used in the application.
 */

const emailTemplates = {
  /**
   * Test email template
   */
  TEST: {
    subject: 'Test Email from StayHub',
    getContent: () => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin: 0;">Welcome to StayHub!</h1>
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <p style="color: #34495e; margin: 0;">This is a test email sent from StayHub application.</p>
          <p style="color: #34495e; margin: 10px 0 0 0;">If you received this email, it means our email service is working correctly.</p>
        </div>
        <div style="text-align: center; color: #7f8c8d; font-size: 14px;">
          <p style="margin: 0;">Best regards,<br>StayHub Team</p>
        </div>
      </div>
    `,
  },

  /**
   * Welcome email template
   */
  WELCOME: {
    subject: 'Welcome to StayHub!',
    getContent: (userName) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin: 0;">Welcome to StayHub, ${userName}!</h1>
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <p style="color: #34495e; margin: 0;">Thank you for joining our community. We're excited to have you on board!</p>
          <p style="color: #34495e; margin: 15px 0 0 0;">With StayHub, you can:</p>
          <ul style="color: #34495e; margin: 10px 0; padding-left: 20px;">
            <li>Find the perfect accommodation for your stay</li>
            <li>Book rooms with ease</li>
            <li>Manage your bookings efficiently</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}" style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">Get Started</a>
        </div>
        <div style="text-align: center; color: #7f8c8d; font-size: 14px;">
          <p style="margin: 0;">If you have any questions, feel free to contact our support team.</p>
          <p style="margin: 10px 0 0 0;">Best regards,<br>StayHub Team</p>
        </div>
      </div>
    `,
  },

  /**
   * Registration confirmation email template
   */
  REGISTRATION: {
    subject: 'Registration Confirmation - StayHub',
    getContent: ({ verificationLink, name }) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin: 0;">Verify Your Email Address</h1>
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <p style="color: #34495e; margin: 0;">Dear ${name},</p>
          <p style="color: #34495e; margin: 15px 0 0 0;">Thank you for signing up with StayHub. To complete your registration and access all features, please verify your email address by clicking the button below:</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email Address</a>
        </div>
        <div style="text-align: center; color: #7f8c8d; font-size: 14px;">
          <p style="margin: 0;">If you didn't request this, please ignore this email.</p>
          <p style="margin: 10px 0 0 0;">This verification link will expire in 1 hour.</p>
          <p style="margin: 10px 0 0 0;">Best regards,<br>StayHub Team</p>
        </div>
      </div>
    `,
  },

  /**
   * Verification email template
   */
  VERIFICATION: {
    subject: 'Verify Your Email Address - StayHub',
    getContent: ({ verificationLink, name }) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin: 0;">Verify Your Email Address</h1>
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <p style="color: #34495e; margin: 0;">Dear ${name},</p>
          <p style="color: #34495e; margin: 15px 0 0 0;">Thank you for signing up with StayHub. To complete your registration and access all features, please verify your email address by clicking the button below:</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email Address</a>
        </div>
        <div style="text-align: center; color: #7f8c8d; font-size: 14px;">
          <p style="margin: 0;">If you didn't request this, please ignore this email.</p>
          <p style="margin: 10px 0 0 0;">This verification link will expire in 1 hour.</p>
          <p style="margin: 10px 0 0 0;">Best regards,<br>StayHub Team</p>
        </div>
      </div>
    `,
  },

  /**
   * Verification code email template
   */
  VERIFICATION_CODE: {
    subject: 'Xác nhận đăng ký - StayHub',
    getContent: ({ code, email }) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin: 0;">Mã xác nhận đăng ký StayHub</h1>
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <p style="color: #34495e; margin: 0;">Xin chào!</p>
          <p style="color: #34495e; margin: 15px 0 0 0;">Cảm ơn bạn đã đăng ký tài khoản StayHub với email: <strong>${email}</strong></p>
          <p style="color: #34495e; margin: 15px 0 0 0;">Để hoàn tất đăng ký, vui lòng nhập mã xác nhận sau vào form đăng ký:</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #3498db; color: white; padding: 20px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 5px; display: inline-block;">${code}</div>
        </div>
        <div style="text-align: center; color: #7f8c8d; font-size: 14px;">
          <p style="margin: 0;">Mã này sẽ hết hạn sau 10 phút.</p>
          <p style="margin: 10px 0 0 0;">Nếu bạn không yêu cầu đăng ký này, vui lòng bỏ qua email này.</p>
          <p style="margin: 10px 0 0 0;">Trân trọng,<br>Đội ngũ StayHub</p>
        </div>
      </div>
    `,
  },

  /**
   * Viewing appointment confirmation email template (Polished)
   */
  VIEWING_CONFIRMATION: {
    subject: 'Xác nhận đặt lịch xem phòng trọ - StayHub',
    getContent: (data) => {
      const {
        customerName,
        roomName,
        roomPrice,
        buildingName,
        buildingAddress,
        viewingDate,
        viewingTime,
        landlordName,
        landlordPhone,
        notes,
      } = data;

      const formatPrice = (price) => {
        try {
          const numPrice =
            typeof price === 'number'
              ? price
              : typeof price === 'string'
              ? parseFloat(price)
              : typeof price === 'object' && price !== null
              ? parseFloat(price.toString())
              : 0;

          if (isNaN(numPrice)) return 'Liên hệ';

          return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(numPrice);
        } catch {
          return typeof price === 'number'
            ? `${price?.toLocaleString?.('vi-VN') || price} ₫`
            : 'Liên hệ';
        }
      };

      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      };

      const SITE = process.env.FRONTEND_URL || 'https://stayhub.com';
      const LOGO =
        'https://cdn-img.upanhlaylink.com/img/image_202506094d11076c38a6a6044e43c4b7acd4d0ad.jpg';

      return `
  <!-- Preheader (hidden in most clients, improves inbox preview) -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    Lịch xem phòng của bạn đã được xác nhận. Xem chi tiết thời gian, địa chỉ và liên hệ chủ nhà trong email này.
  </div>

  <div style="background-color:#f3f5f9; padding:24px;">
    <div style="font-family: -apple-system, Segoe UI, Roboto, Arial, 'Noto Sans', Helvetica, sans-serif; max-width:680px; margin:0 auto;">

      <!-- Card wrapper -->
      <div style="background-color:#ffffff; border:1px solid #e6ebf1; border-radius:14px; overflow:hidden; box-shadow:0 6px 20px rgba(16,24,40,.06);">

        <!-- Header -->
        <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%); padding:32px 28px; text-align:center; position:relative;">
          <a href="${SITE}" style="text-decoration:none; display:inline-block;">
            <img src="${LOGO}" width="72" height="72" alt="StayHub" style="border-radius:14px; display:block; margin:0 auto 14px auto; outline:none; border:none;">
          </a>
          <h1 style="margin:0; color:#ffffff; font-size:26px; line-height:1.3; font-weight:700;">
            Đặt lịch xem phòng thành công!
          </h1>
          <p style="margin:8px 0 0 0; color:rgba(255,255,255,.9); font-size:15px; line-height:1.6;">
            Cảm ơn bạn đã tin tưởng StayHub
          </p>
        </div>

        <!-- Body -->
        <div style="padding:36px 28px 8px 28px;">
          <!-- Greeting -->
          <div style="margin:0 0 22px 0;">
            <h2 style="margin:0 0 8px 0; color:#1f2937; font-size:20px; line-height:1.5; font-weight:700;">Xin chào ${customerName} 👋</h2>
            <p style="margin:0; color:#4b5563; font-size:15px; line-height:1.75;">
              Chúng tôi đã nhận được yêu cầu đặt lịch xem phòng của bạn. Dưới đây là thông tin chi tiết về cuộc hẹn:
            </p>
          </div>

          <!-- Appointment Details -->
          <div style="background-color:#f7fafc; border:1px solid #e5e7eb; border-radius:12px; padding:20px; margin-bottom:22px;">
            <h3 style="margin:0 0 14px 0; color:#4f46e5; font-size:16px; font-weight:700; display:flex; align-items:center;">
              <span style="margin-right:8px;">📅</span> Thông tin lịch hẹn
            </h3>

            <div style="display:block;">
              <div style="display:flex; padding:10px 0; border-top:1px solid #eef2f7;">
                <div style="min-width:130px; color:#6b7280; font-weight:600;">Ngày hẹn:</div>
                <div style="color:#111827; font-weight:600;">${formatDate(viewingDate)}</div>
              </div>
              <div style="display:flex; padding:10px 0; border-top:1px solid #eef2f7;">
                <div style="min-width:130px; color:#6b7280; font-weight:600;">Thời gian:</div>
                <div style="color:#111827; font-weight:600;">${viewingTime}</div>
              </div>
              <div style="display:flex; padding:10px 0; border-top:1px solid #eef2f7;">
                <div style="min-width:130px; color:#6b7280; font-weight:600;">Trạng thái:</div>
                <div style="background-color:#22c55e; color:#ffffff; padding:4px 10px; border-radius:999px; font-size:12px; font-weight:700; display:inline-block;">
                  ✓ ĐÃ XÁC NHẬN
                </div>
              </div>
            </div>
          </div>

          <!-- Room Info -->
          <div style="background-color:#f7fafc; border:1px solid #e5e7eb; border-radius:12px; padding:20px; margin-bottom:22px;">
            <h3 style="margin:0 0 14px 0; color:#4f46e5; font-size:16px; font-weight:700; display:flex; align-items:center;">
              <span style="margin-right:8px;">🏠</span> Thông tin phòng trọ
            </h3>
            <div>
              <div style="display:flex; padding:10px 0; border-top:1px solid #eef2f7;">
                <div style="min-width:130px; color:#6b7280; font-weight:600;">Tên phòng:</div>
                <div style="color:#111827; font-weight:700;">${roomName}</div>
              </div>
              <div style="display:flex; padding:10px 0; border-top:1px solid #eef2f7;">
                <div style="min-width:130px; color:#6b7280; font-weight:600;">Giá phòng:</div>
                <div style="color:#dc2626; font-weight:800; font-size:18px;">${formatPrice(
                  roomPrice
                )}/tháng</div>
              </div>
              <div style="display:flex; padding:10px 0; border-top:1px solid #eef2f7;">
                <div style="min-width:130px; color:#6b7280; font-weight:600;">Tòa nhà:</div>
                <div style="color:#111827; font-weight:700;">${buildingName}</div>
              </div>
              <div style="display:flex; padding:10px 0; border-top:1px solid #eef2f7;">
                <div style="min-width:130px; color:#6b7280; font-weight:600;">Địa chỉ:</div>
                <div style="color:#111827;">${
                  typeof buildingAddress === 'string'
                    ? buildingAddress
                    : buildingAddress?.address ||
                      buildingAddress?.street ||
                      'Địa chỉ không xác định'
                }</div>
              </div>
            </div>
          </div>

          <!-- Landlord -->
          <div style="background-color:#f0fff4; border:1px solid #bbf7d0; border-radius:12px; padding:20px; margin-bottom:22px;">
            <h3 style="margin:0 0 14px 0; color:#16a34a; font-size:16px; font-weight:700; display:flex; align-items:center;">
              <span style="margin-right:8px;">👤</span> Thông tin chủ nhà
            </h3>
            <div>
              <div style="display:flex; padding:10px 0; border-top:1px solid #d1fae5;">
                <div style="min-width:130px; color:#15803d; font-weight:700;">Tên chủ nhà:</div>
                <div style="color:#0f172a; font-weight:700;">${landlordName}</div>
              </div>
              <div style="display:flex; padding:10px 0; border-top:1px solid #d1fae5;">
                <div style="min-width:130px; color:#15803d; font-weight:700;">Số điện thoại:</div>
                <div style="color:#0f172a; font-weight:700;">
                  <a href="tel:${landlordPhone}" style="color:#16a34a; text-decoration:none;">${landlordPhone}</a>
                </div>
              </div>
            </div>
          </div>

          ${
            notes
              ? `
          <!-- Notes -->
          <div style="background-color:#fffaf0; border:1px solid #fde68a; border-radius:12px; padding:18px; margin-bottom:22px;">
            <h3 style="margin:0 0 10px 0; color:#b45309; font-size:15px; font-weight:700; display:flex; align-items:center;">
              <span style="margin-right:8px;">📝</span> Ghi chú
            </h3>
            <p style="margin:0; color:#7c4a03; font-size:14px; line-height:1.7; font-style:italic;">"${notes}"</p>
          </div>`
              : ''
          }

          <!-- Important -->
          <div style="background-color:#fff7ed; border-left:4px solid #fb923c; padding:16px 18px; border-radius:0 10px 10px 0; margin-bottom:22px;">
            <h4 style="margin:0 0 8px 0; color:#9a3412; font-size:14px;">⚠️ Lưu ý quan trọng:</h4>
            <ul style="margin:0; padding-left:18px; color:#7c2d12; line-height:1.8; font-size:14px;">
              <li>Vui lòng đến đúng giờ đã hẹn</li>
              <li>Mang theo CMND/CCCD để xác minh thông tin</li>
              <li>Nếu có thay đổi, vui lòng liên hệ chủ nhà trước ít nhất 2 tiếng</li>
              <li>Chuẩn bị sẵn các câu hỏi muốn tìm hiểu về phòng trọ</li>
            </ul>
          </div>

          <!-- CTA Buttons -->
          <div style="text-align:center; margin:28px 0 10px 0;">
            <a href="tel:${landlordPhone}" style="background:linear-gradient(135deg,#22c55e,#16a34a); color:#ffffff; padding:14px 22px; text-decoration:none; border-radius:10px; display:inline-block; font-weight:800; box-shadow:0 6px 16px rgba(22,163,74,.25); margin:0 6px;">
              📞 Gọi chủ nhà
            </a>
            <a href="${SITE}" style="background:linear-gradient(135deg,#667eea,#764ba2); color:#ffffff; padding:14px 22px; text-decoration:none; border-radius:10px; display:inline-block; font-weight:800; box-shadow:0 6px 16px rgba(103,116,236,.25); margin:0 6px;">
              🏠 Xem thêm phòng
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color:#f8fafc; padding:24px 28px; border-top:1px solid #e6ebf1; text-align:center;">
          <p style="margin:0 0 12px 0; color:#374151; font-size:13px;">Cảm ơn bạn đã sử dụng dịch vụ của StayHub!</p>
          <div style="margin-bottom:14px;">
            <a href="mailto:support@stayhub.com" style="color:#4f46e5; text-decoration:none; margin:0 10px;">📧 support@stayhub.com</a>
            <a href="tel:1900-1234" style="color:#4f46e5; text-decoration:none; margin:0 10px;">📞 1900-1234</a>
          </div>
          <p style="margin:0; color:#9ca3af; font-size:12px;">© 2025 StayHub. Tất cả quyền được bảo lưu.</p>
        </div>

      </div>
    </div>
  </div>
    `;
    },
  },

  /**
   * Viewing appointment confirmation - For tenant/guest
   */
  VIEWING_APPOINTMENT_RENTER: {
    subject: 'Xác nhận lịch hẹn xem phòng - StayHub',
    getContent: (data) => `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; padding: 0; background-color: #f8f9fa;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">📅 Xác nhận lịch hẹn</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Bạn đã đặt lịch xem phòng thành công!</p>
        </div>
        
        <!-- Content -->
        <div style="background-color: white; padding: 40px 30px;">
          <p style="color: #2c3e50; font-size: 16px; margin: 0 0 25px 0;">Xin chào <strong>${
            data.renterName
          }</strong>,</p>
          
          <p style="color: #34495e; line-height: 1.6; margin: 0 0 25px 0;">
            Cảm ơn bạn đã sử dụng StayHub! Lịch hẹn xem phòng của bạn đã được ghi nhận thành công.
          </p>
          
          <!-- Appointment Details -->
          <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-radius: 12px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 18px;">📋 Thông tin lịch hẹn</h3>
            
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
              <div style="flex: 1; min-width: 250px;">
                <div style="margin-bottom: 15px;">
                  <span style="display: inline-block; width: 100px; color: #7f8c8d; font-weight: 600;">📅 Ngày:</span>
                  <span style="color: #2c3e50; font-weight: 600;">${data.viewingDate}</span>
                </div>
                <div style="margin-bottom: 15px;">
                  <span style="display: inline-block; width: 100px; color: #7f8c8d; font-weight: 600;">🕐 Giờ:</span>
                  <span style="color: #2c3e50; font-weight: 600;">${data.viewingTime}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Room Details -->
          <div style="border: 2px solid #e74c3c; border-radius: 12px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #e74c3c; margin: 0 0 20px 0; font-size: 18px;">🏠 Thông tin phòng trọ</h3>
            
            <div style="margin-bottom: 15px;">
              <span style="display: inline-block; width: 120px; color: #7f8c8d; font-weight: 600;">Tên phòng:</span>
              <span style="color: #2c3e50; font-weight: 600;">${data.roomName}</span>
            </div>
            <div style="margin-bottom: 15px;">
              <span style="display: inline-block; width: 120px; color: #7f8c8d; font-weight: 600;">Giá thuê:</span>
              <span style="color: #e74c3c; font-weight: 600; font-size: 18px;">${
                typeof data.roomPrice === 'number'
                  ? data.roomPrice.toLocaleString('vi-VN') + '₫'
                  : 'Liên hệ'
              }/tháng</span>
            </div>
            <div style="margin-bottom: 15px;">
              <span style="display: inline-block; width: 120px; color: #7f8c8d; font-weight: 600;">Địa chỉ:</span>
              <span style="color: #2c3e50;">${
                typeof data.roomAddress === 'string'
                  ? data.roomAddress
                  : data.roomAddress?.address ||
                    data.roomAddress?.street ||
                    'Địa chỉ không xác định'
              }</span>
            </div>
          </div>
          
          <!-- Landlord Contact -->
          <div style="background-color: #ecf0f1; border-radius: 12px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 18px;">👤 Thông tin chủ trọ</h3>
            
            <div style="margin-bottom: 15px;">
              <span style="display: inline-block; width: 120px; color: #7f8c8d; font-weight: 600;">Họ tên:</span>
              <span style="color: #2c3e50; font-weight: 600;">${data.landlordName}</span>
            </div>
            <div style="margin-bottom: 15px;">
              <span style="display: inline-block; width: 120px; color: #7f8c8d; font-weight: 600;">Điện thoại:</span>
              <span style="color: #2c3e50; font-weight: 600;">${data.landlordPhone}</span>
            </div>
            <div style="margin-bottom: 15px;">
              <span style="display: inline-block; width: 120px; color: #7f8c8d; font-weight: 600;">Email:</span>
              <span style="color: #2c3e50;">${data.landlordEmail}</span>
            </div>
          </div>
          
          <!-- Important Notes -->
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <h4 style="color: #856404; margin: 0 0 15px 0; font-size: 16px;">⚠️ Lưu ý quan trọng:</h4>
            <ul style="color: #856404; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Vui lòng đến đúng giờ hẹn để tránh ảnh hưởng đến lịch của chủ trọ</li>
              <li>Mang theo giấy tờ tùy thân để xác minh danh tính</li>
              <li>Liên hệ với chủ trọ trước 24h nếu cần thay đổi lịch hẹn</li>
              <li>Chuẩn bị các câu hỏi về phòng trọ, tiện ích, điều khoản thuê</li>
            </ul>
          </div>
          
          <!-- Action Buttons -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="tel:${
              data.landlordPhone
            }" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; display: inline-block; margin: 5px 10px; font-weight: 600;">📞 Gọi chủ trọ</a>
            <a href="${process.env.FRONTEND_URL}/rooms/${
      data.roomId
    }" style="background: linear-gradient(135deg, #007bff 0%, #6f42c1 100%); color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; display: inline-block; margin: 5px 10px; font-weight: 600;">🏠 Xem chi tiết phòng</a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #2c3e50; padding: 25px 30px; text-align: center;">
          <p style="color: #bdc3c7; margin: 0 0 10px 0; font-size: 14px;">
            Email này được gửi tự động từ hệ thống StayHub
          </p>
          <p style="color: #95a5a6; margin: 0; font-size: 12px;">
            © 2025 StayHub. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    `,
  },

  /**
   * Viewing appointment notification - For landlord
   */
  VIEWING_APPOINTMENT_LANDLORD: {
    subject: 'Thông báo lịch hẹn xem phòng mới - StayHub',
    getContent: (data) => `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; padding: 0; background-color: #f8f9fa;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">🔔 Lịch hẹn mới</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Có khách hàng muốn xem phòng của bạn!</p>
        </div>
        
        <!-- Content -->
        <div style="background-color: white; padding: 40px 30px;">
          <p style="color: #2c3e50; font-size: 16px; margin: 0 0 25px 0;">Xin chào <strong>${
            data.landlordName
          }</strong>,</p>
          
          <p style="color: #34495e; line-height: 1.6; margin: 0 0 25px 0;">
            Bạn có một lịch hẹn xem phòng mới từ khách hàng quan tâm. Vui lòng xem thông tin chi tiết bên dưới:
          </p>
          
          <!-- Appointment Details -->
          <div style="background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%); border-radius: 12px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #2d3436; margin: 0 0 20px 0; font-size: 18px;">📋 Thông tin lịch hẹn</h3>
            
            <div style="margin-bottom: 15px;">
              <span style="display: inline-block; width: 100px; color: #636e72; font-weight: 600;">📅 Ngày:</span>
              <span style="color: #2d3436; font-weight: 600;">${data.viewingDate}</span>
            </div>
            <div style="margin-bottom: 15px;">
              <span style="display: inline-block; width: 100px; color: #636e72; font-weight: 600;">🕐 Giờ:</span>
              <span style="color: #2d3436; font-weight: 600;">${data.viewingTime}</span>
            </div>
          </div>
          
          <!-- Customer Details -->
          <div style="border: 2px solid #0984e3; border-radius: 12px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #0984e3; margin: 0 0 20px 0; font-size: 18px;">👤 Thông tin khách hàng</h3>
            
            <div style="margin-bottom: 15px;">
              <span style="display: inline-block; width: 120px; color: #7f8c8d; font-weight: 600;">Họ tên:</span>
              <span style="color: #2c3e50; font-weight: 600;">${data.renterName}</span>
            </div>
            <div style="margin-bottom: 15px;">
              <span style="display: inline-block; width: 120px; color: #7f8c8d; font-weight: 600;">Điện thoại:</span>
              <span style="color: #2c3e50; font-weight: 600;">${data.renterPhone}</span>
            </div>
            <div style="margin-bottom: 15px;">
              <span style="display: inline-block; width: 120px; color: #7f8c8d; font-weight: 600;">Email:</span>
              <span style="color: #2c3e50;">${data.renterEmail}</span>
            </div>
            ${
              data.notes
                ? `
            <div style="margin-top: 20px;">
              <span style="display: block; color: #7f8c8d; font-weight: 600; margin-bottom: 8px;">Ghi chú:</span>
              <div style="background-color: #f8f9fa; padding: 12px; border-radius: 6px; color: #2c3e50;">
                ${data.notes}
              </div>
            </div>
            `
                : ''
            }
          </div>
          
          <!-- Room Details -->
          <div style="background-color: #ddd6fe; border-radius: 12px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #6366f1; margin: 0 0 20px 0; font-size: 18px;">🏠 Thông tin phòng</h3>
            
            <div style="margin-bottom: 15px;">
              <span style="display: inline-block; width: 120px; color: #7f8c8d; font-weight: 600;">Tên phòng:</span>
              <span style="color: #2c3e50; font-weight: 600;">${data.roomName}</span>
            </div>
            <div style="margin-bottom: 15px;">
              <span style="display: inline-block; width: 120px; color: #7f8c8d; font-weight: 600;">Giá thuê:</span>
              <span style="color: #e74c3c; font-weight: 600; font-size: 18px;">${
                typeof data.roomPrice === 'number'
                  ? data.roomPrice.toLocaleString('vi-VN') + '₫'
                  : 'Liên hệ'
              }/tháng</span>
            </div>
            <div style="margin-bottom: 15px;">
              <span style="display: inline-block; width: 120px; color: #7f8c8d; font-weight: 600;">Địa chỉ:</span>
              <span style="color: #2c3e50;">${
                typeof data.roomAddress === 'string'
                  ? data.roomAddress
                  : data.roomAddress?.address ||
                    data.roomAddress?.street ||
                    'Địa chỉ không xác định'
              }</span>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="tel:${
              data.renterPhone
            }" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; display: inline-block; margin: 5px 10px; font-weight: 600;">📞 Gọi khách hàng</a>
            <a href="mailto:${
              data.renterEmail
            }" style="background: linear-gradient(135deg, #ffc107 0%, #ff8f00 100%); color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; display: inline-block; margin: 5px 10px; font-weight: 600;">📧 Gửi email</a>
          </div>
          
          <!-- Important Notes -->
          <div style="background-color: #d1ecf1; border-left: 4px solid #17a2b8; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <h4 style="color: #0c5460; margin: 0 0 15px 0; font-size: 16px;">💡 Gợi ý:</h4>
            <ul style="color: #0c5460; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Liên hệ với khách hàng để xác nhận lại thời gian</li>
              <li>Chuẩn bị phòng sạch sẽ, gọn gàng trước khi khách đến xem</li>
              <li>Chuẩn bị thông tin về tiện ích, quy định của khu vực</li>
              <li>Mang theo hợp đồng mẫu nếu khách hàng quyết định thuê</li>
            </ul>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #2c3e50; padding: 25px 30px; text-align: center;">
          <p style="color: #bdc3c7; margin: 0 0 10px 0; font-size: 14px;">
            Email này được gửi tự động từ hệ thống StayHub
          </p>
          <p style="color: #95a5a6; margin: 0; font-size: 12px;">
            © 2025 StayHub. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    `,
  },

  /**
   * Bill notification email template - For renter
   */
  BILL_NOTIFICATION: {
    subject: 'Hóa đơn mới - StayHub',
    getContent: (data) => {
      const formatPrice = (price) => {
        try {
          const numPrice = typeof price === 'number' ? price : parseFloat(price) || 0;
          return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(numPrice);
        } catch {
          return typeof price === 'number'
            ? `${price?.toLocaleString?.('vi-VN') || price} ₫`
            : '0 ₫';
        }
      };

      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      };

      const SITE = process.env.FRONTEND_URL || 'https://stayhub.com';
      const LOGO =
        'https://cdn-img.upanhlaylink.com/img/image_202506094d11076c38a6a6044e43c4b7acd4d0ad.jpg';

      return `
        <!-- Preheader -->
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
          Hóa đơn mới từ chủ trọ. Xem chi tiết số tiền và hạn thanh toán trong email này.
        </div>

        <div style="background-color:#f3f5f9; padding:24px;">
          <div style="font-family: -apple-system, Segoe UI, Roboto, Arial, 'Noto Sans', Helvetica, sans-serif; max-width:680px; margin:0 auto;">

            <!-- Card wrapper -->
            <div style="background-color:#ffffff; border:1px solid #e6ebf1; border-radius:14px; overflow:hidden; box-shadow:0 6px 20px rgba(16,24,40,.06);">

              <!-- Header -->
              <div style="background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%); padding:32px 28px; text-align:center; position:relative;">
                <a href="${SITE}" style="text-decoration:none; display:inline-block;">
                  <img src="${LOGO}" width="72" height="72" alt="StayHub" style="border-radius:14px; display:block; margin:0 auto 14px auto; outline:none; border:none;">
                </a>
                <h1 style="margin:0; color:#ffffff; font-size:26px; line-height:1.3; font-weight:700;">
                  💰 Hóa đơn mới
                </h1>
                <p style="margin:8px 0 0 0; color:rgba(255,255,255,.9); font-size:15px; line-height:1.6;">
                  Chủ trọ đã tạo hóa đơn cho bạn
                </p>
              </div>

              <!-- Body -->
              <div style="padding:36px 28px 8px 28px;">
                <!-- Greeting -->
                <div style="margin:0 0 22px 0;">
                  <h2 style="margin:0 0 8px 0; color:#1f2937; font-size:20px; line-height:1.5; font-weight:700;">Xin chào ${
                    data.renterName
                  } 👋</h2>
                  <p style="margin:0; color:#4b5563; font-size:15px; line-height:1.75;">
                    Chủ trọ đã tạo hóa đơn mới cho bạn. Dưới đây là thông tin chi tiết:
                  </p>
                </div>

                <!-- Bill Details -->
                <div style="background-color:#f7fafc; border:1px solid #e5e7eb; border-radius:12px; padding:20px; margin-bottom:22px;">
                  <h3 style="margin:0 0 14px 0; color:#f59e0b; font-size:16px; font-weight:700; display:flex; align-items:center;">
                    <span style="margin-right:8px;">📄</span> Thông tin hóa đơn
                  </h3>

                  <div style="display:block;">
                    <div style="display:flex; padding:10px 0; border-top:1px solid #eef2f7;">
                      <div style="min-width:130px; color:#6b7280; font-weight:600;">Mã hóa đơn:</div>
                      <div style="color:#111827; font-weight:600;">#${
                        data.billId ? data.billId.substring(data.billId.length - 8) : 'N/A'
                      }</div>
                    </div>
                    <div style="display:flex; padding:10px 0; border-top:1px solid #eef2f7;">
                      <div style="min-width:130px; color:#6b7280; font-weight:600;">Tháng/Năm:</div>
                      <div style="color:#111827; font-weight:600;">${data.month}/${data.year}</div>
                    </div>
                    <div style="display:flex; padding:10px 0; border-top:1px solid #eef2f7;">
                      <div style="min-width:130px; color:#6b7280; font-weight:600;">Loại hóa đơn:</div>
                      <div style="color:#111827; font-weight:600;">${
                        data.type === 'monthly'
                          ? 'Hàng tháng'
                          : data.type === 'deposit'
                          ? 'Đặt cọc'
                          : 'Một lần'
                      }</div>
                    </div>
                    <div style="display:flex; padding:10px 0; border-top:1px solid #eef2f7;">
                      <div style="min-width:130px; color:#6b7280; font-weight:600;">Trạng thái:</div>
                      <div style="background-color:#f59e0b; color:#ffffff; padding:4px 10px; border-radius:999px; font-size:12px; font-weight:700; display:inline-block;">
                        ${
                          data.status === 'pending'
                            ? '⏳ CHƯA THANH TOÁN'
                            : data.status === 'paid'
                            ? '✅ ĐÃ THANH TOÁN'
                            : '❌ QUÁ HẠN'
                        }
                      </div>
                    </div>
                    <div style="display:flex; padding:10px 0; border-top:1px solid #eef2f7;">
                      <div style="min-width:130px; color:#6b7280; font-weight:600;">Hạn thanh toán:</div>
                      <div style="color:#111827; font-weight:600;">${
                        data.dueDate ? formatDate(data.dueDate) : 'Chưa xác định'
                      }</div>
                    </div>
                  </div>
                </div>

                <!-- Room Info -->
                <div style="background-color:#f7fafc; border:1px solid #e5e7eb; border-radius:12px; padding:20px; margin-bottom:22px;">
                  <h3 style="margin:0 0 14px 0; color:#4f46e5; font-size:16px; font-weight:700; display:flex; align-items:center;">
                    <span style="margin-right:8px;">🏠</span> Thông tin phòng trọ
                  </h3>
                  <div>
                    <div style="display:flex; padding:10px 0; border-top:1px solid #eef2f7;">
                      <div style="min-width:130px; color:#6b7280; font-weight:600;">Tên phòng:</div>
                      <div style="color:#111827; font-weight:700;">${data.roomName || 'N/A'}</div>
                    </div>
                    <div style="display:flex; padding:10px 0; border-top:1px solid #eef2f7;">
                      <div style="min-width:130px; color:#6b7280; font-weight:600;">Địa chỉ:</div>
                      <div style="color:#111827;">${data.roomAddress || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                <!-- Amount Breakdown -->
                <div style="background-color:#f0f9ff; border:1px solid #0ea5e9; border-radius:12px; padding:20px; margin-bottom:22px;">
                  <h3 style="margin:0 0 14px 0; color:#0ea5e9; font-size:16px; font-weight:700; display:flex; align-items:center;">
                    <span style="margin-right:8px;">💸</span> Chi tiết thanh toán
                  </h3>
                  <div>
                    <div style="display:flex; padding:10px 0; border-top:1px solid #bae6fd;">
                      <div style="min-width:130px; color:#0369a1; font-weight:700;">Tiền thuê phòng:</div>
                      <div style="color:#0f172a; font-weight:700;">${formatPrice(
                        data.amount?.rent || 0
                      )}</div>
                    </div>
                    <div style="display:flex; padding:10px 0; border-top:1px solid #bae6fd;">
                      <div style="min-width:130px; color:#0369a1; font-weight:700;">Tiền điện:</div>
                      <div style="color:#0f172a; font-weight:700;">${formatPrice(
                        data.amount?.electricity || 0
                      )}</div>
                    </div>
                    <div style="display:flex; padding:10px 0; border-top:1px solid #bae6fd;">
                      <div style="min-width:130px; color:#0369a1; font-weight:700;">Tiền nước:</div>
                      <div style="color:#0f172a; font-weight:700;">${formatPrice(
                        data.amount?.water || 0
                      )}</div>
                    </div>
                    <div style="display:flex; padding:10px 0; border-top:1px solid #bae6fd;">
                      <div style="min-width:130px; color:#0369a1; font-weight:700;">Phí dịch vụ:</div>
                      <div style="color:#0f172a; font-weight:700;">${formatPrice(
                        data.amount?.service || 0
                      )}</div>
                    </div>
                    <div style="display:flex; padding:10px 0; border-top:2px solid #0ea5e9; background-color:#e0f2fe;">
                      <div style="min-width:130px; color:#0c4a6e; font-weight:800; font-size:16px;">TỔNG CỘNG:</div>
                      <div style="color:#0c4a6e; font-weight:800; font-size:16px;">${formatPrice(
                        data.totalAmount || 0
                      )}</div>
                    </div>
                  </div>
                </div>

                <!-- Notes -->
                <div style="background-color:#fef3c7; border:1px solid #f59e0b; border-radius:12px; padding:18px; margin-bottom:22px;">
                  <h3 style="margin:0 0 10px 0; color:#92400e; font-size:14px; font-weight:700;">📝 Lưu ý quan trọng:</h3>
                  <ul style="margin:0; padding-left:18px; color:#7c2d12; line-height:1.8; font-size:14px;">
                    <li>Vui lòng thanh toán trước hạn để tránh bị phạt hoặc gián đoạn dịch vụ</li>
                    <li>Giữ biên lai thanh toán để đối chiếu nếu cần thiết</li>
                    <li>Nếu có bất kỳ vấn đề nào, liên hệ với chủ trọ hoặc bộ phận hỗ trợ StayHub</li>
                  </ul>
                </div>

                <!-- CTA Buttons -->
                <div style="text-align:center; margin:28px 0 10px 0;">
                  <a href="${SITE}/bills/${
        data.billId
      }" style="background:linear-gradient(135deg,#f59e0b,#d97706); color:#ffffff; padding:14px 22px; text-decoration:none; border-radius:10px; display:inline-block; font-weight:800; box-shadow:0 6px 16px rgba(217,119,6,.25); margin:0 6px;">
                    💳 Thanh toán ngay
                  </a>
                  <a href="${SITE}/support" style="background:linear-gradient(135deg,#4f46e5,#6366f1); color:#ffffff; padding:14px 22px; text-decoration:none; border-radius:10px; display:inline-block; font-weight:800; box-shadow:0 6px 16px rgba(99,102,241,.25); margin:0 6px;">
                    📞 Liên hệ hỗ trợ
                  </a>
                </div>
              </div>

              <!-- Footer -->
              <div style="background-color:#f8fafc; padding:24px 28px; border-top:1px solid #e6ebf1; text-align:center;">
                <p style="margin:0 0 12px 0; color:#374151; font-size:13px;">Cảm ơn bạn đã sử dụng dịch vụ của StayHub!</p>
                <div style="margin-bottom:14px;">
                  <a href="mailto:support@stayhub.com" style="color:#4f46e5; text-decoration:none; margin:0 10px;">📧 support@stayhub.com</a>
                  <a href="tel:1900-1234" style="color:#4f46e5; text-decoration:none; margin:0 10px;">📞 1900-1234</a>
                </div>
                <p style="margin:0; color:#9ca3af; font-size:12px;">© 2025 StayHub. Tất cả quyền được bảo lưu.</p>
              </div>

            </div>
          </div>
        </div>
      `;
    },
  },
};

module.exports = emailTemplates;
