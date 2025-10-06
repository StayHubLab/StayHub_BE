# 🎨 Frontend Integration Guide - Manual Payment Verification

## Overview
This guide provides complete React + Ant Design implementation for the manual payment verification system.

---

## 📦 Required Dependencies

```bash
npm install axios antd @ant-design/icons moment
```

---

## 🔧 API Service Configuration

### File: `src/services/api.js`

```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 💳 Payment API Service

### File: `src/services/paymentService.js`

```javascript
import api from './api';

class PaymentService {
  /**
   * Upload payment evidence (Renter)
   * @param {string} billId - Bill ID
   * @param {File} file - Payment evidence file
   */
  async uploadPaymentEvidence(billId, file) {
    const formData = new FormData();
    formData.append('billId', billId);
    formData.append('paymentEvidence', file);

    const response = await api.post('/payments/upload-evidence', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Get renter's payment history
   * @param {string} status - Optional status filter
   */
  async getMyPayments(status = null) {
    const params = status ? { status } : {};
    const response = await api.get('/payments/my-payments', { params });
    return response.data;
  }

  /**
   * Get payment details
   * @param {string} paymentId - Payment/Bill ID
   */
  async getPaymentDetails(paymentId) {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  }

  /**
   * Get payments by status (Landlord)
   * @param {string} status - pending_approval | approved | rejected
   */
  async getPaymentsByStatus(status) {
    const response = await api.get(`/payments/status/${status}`);
    return response.data;
  }

  /**
   * Approve payment (Landlord)
   * @param {string} paymentId - Payment/Bill ID
   * @param {string} notes - Optional notes
   */
  async approvePayment(paymentId, notes = '') {
    const response = await api.put(`/payments/${paymentId}/approve`, { notes });
    return response.data;
  }

  /**
   * Reject payment (Landlord)
   * @param {string} paymentId - Payment/Bill ID
   * @param {string} reason - Rejection reason
   */
  async rejectPayment(paymentId, reason) {
    const response = await api.put(`/payments/${paymentId}/reject`, { reason });
    return response.data;
  }
}

export default new PaymentService();
```

---

## 🧑‍💼 Renter Components

### 1. Upload Payment Evidence Modal

**File:** `src/components/Renter/UploadPaymentEvidenceModal.jsx`

```jsx
import React, { useState } from 'react';
import { Modal, Upload, message, Button, Form } from 'antd';
import { UploadOutlined, InboxOutlined } from '@ant-design/icons';
import paymentService from '../../services/paymentService';

const { Dragger } = Upload;

const UploadPaymentEvidenceModal = ({ visible, onClose, billId, onSuccess }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    try {
      const file = fileList[0].originFileObj;
      const result = await paymentService.uploadPaymentEvidence(billId, file);
      
      message.success('Payment evidence uploaded successfully!');
      setFileList([]);
      form.resetFields();
      onSuccess?.(result.data);
      onClose();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to upload payment evidence');
    } finally {
      setUploading(false);
    }
  };

  const uploadProps = {
    name: 'paymentEvidence',
    multiple: false,
    fileList,
    beforeUpload: (file) => {
      // Validate file type
      const isValidType = 
        file.type === 'image/jpeg' || 
        file.type === 'image/png' || 
        file.type === 'application/pdf';
      
      if (!isValidType) {
        message.error('You can only upload JPG/PNG/PDF files!');
        return Upload.LIST_IGNORE;
      }

      // Validate file size (5MB)
      const isValidSize = file.size / 1024 / 1024 < 5;
      if (!isValidSize) {
        message.error('File must be smaller than 5MB!');
        return Upload.LIST_IGNORE;
      }

      setFileList([file]);
      return false; // Prevent auto upload
    },
    onRemove: () => {
      setFileList([]);
    },
  };

  return (
    <Modal
      title="Upload Payment Evidence"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="upload"
          type="primary"
          loading={uploading}
          onClick={handleUpload}
          disabled={fileList.length === 0}
        >
          Upload
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Payment Evidence"
          extra="Upload bank transfer screenshot or receipt (JPG, PNG, or PDF, max 5MB)"
        >
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">
              Support for JPG, PNG, or PDF file. Maximum size 5MB.
            </p>
          </Dragger>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UploadPaymentEvidenceModal;
```

---

### 2. Renter Payment History Page

**File:** `src/pages/Renter/PaymentHistory.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Select,
  message,
  Image,
  Modal,
  Typography,
} from 'antd';
import {
  DollarOutlined,
  FileImageOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import paymentService from '../../services/paymentService';
import UploadPaymentEvidenceModal from '../../components/Renter/UploadPaymentEvidenceModal';

const { Option } = Select;
const { Text, Title } = Typography;

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState(null);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState(null);
  const [evidencePreview, setEvidencePreview] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const result = await paymentService.getMyPayments(statusFilter);
      setPayments(result.data);
    } catch (error) {
      message.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status, approvalStatus) => {
    if (status === 'paid' && approvalStatus === 'approved') {
      return <Tag color="success" icon={<CheckCircleOutlined />}>Paid</Tag>;
    }
    if (status === 'pending_approval' || approvalStatus === 'pending_approval') {
      return <Tag color="warning" icon={<ClockCircleOutlined />}>Pending Approval</Tag>;
    }
    if (status === 'rejected' || approvalStatus === 'rejected') {
      return <Tag color="error" icon={<CloseCircleOutlined />}>Rejected</Tag>;
    }
    if (status === 'overdue') {
      return <Tag color="error">Overdue</Tag>;
    }
    return <Tag color="default" icon={<ClockCircleOutlined />}>Pending</Tag>;
  };

  const handleUploadSuccess = () => {
    fetchPayments();
    message.success('Payment evidence uploaded! Waiting for landlord approval.');
  };

  const columns = [
    {
      title: 'Bill ID',
      dataIndex: '_id',
      key: '_id',
      render: (id) => <Text copyable>{id.slice(-8)}</Text>,
    },
    {
      title: 'Room',
      dataIndex: ['contractId', 'roomId', 'name'],
      key: 'room',
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'amount',
      render: (amount) => (
        <Text strong style={{ color: '#1890ff' }}>
          {amount?.toLocaleString()} VND
        </Text>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag>{type}</Tag>,
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => moment(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => getStatusTag(record.status, record.approvalStatus),
    },
    {
      title: 'Evidence',
      dataIndex: 'paymentEvidence',
      key: 'evidence',
      render: (url) =>
        url ? (
          <Button
            type="link"
            icon={<FileImageOutlined />}
            onClick={() => setEvidencePreview(url)}
          >
            View
          </Button>
        ) : (
          <Text type="secondary">No evidence</Text>
        ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => {
        const canUpload =
          record.status === 'pending' ||
          record.status === 'rejected' ||
          !record.paymentEvidence;

        return (
          <Space>
            {canUpload && (
              <Button
                type="primary"
                icon={<DollarOutlined />}
                onClick={() => {
                  setSelectedBillId(record._id);
                  setUploadModalVisible(true);
                }}
              >
                Upload Evidence
              </Button>
            )}
            {record.status === 'rejected' && record.rejectionReason && (
              <Button
                type="text"
                danger
                onClick={() => {
                  Modal.info({
                    title: 'Rejection Reason',
                    content: record.rejectionReason,
                  });
                }}
              >
                View Reason
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3}>Payment History</Title>
            <Select
              placeholder="Filter by status"
              allowClear
              style={{ width: 200 }}
              onChange={setStatusFilter}
            >
              <Option value="pending">Pending</Option>
              <Option value="pending_approval">Pending Approval</Option>
              <Option value="paid">Paid</Option>
              <Option value="rejected">Rejected</Option>
              <Option value="overdue">Overdue</Option>
            </Select>
          </div>

          <Table
            columns={columns}
            dataSource={payments}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Space>
      </Card>

      {/* Upload Modal */}
      <UploadPaymentEvidenceModal
        visible={uploadModalVisible}
        onClose={() => {
          setUploadModalVisible(false);
          setSelectedBillId(null);
        }}
        billId={selectedBillId}
        onSuccess={handleUploadSuccess}
      />

      {/* Evidence Preview Modal */}
      <Modal
        title="Payment Evidence"
        open={!!evidencePreview}
        onCancel={() => setEvidencePreview(null)}
        footer={null}
        width={800}
      >
        <Image src={evidencePreview} alt="Payment Evidence" style={{ width: '100%' }} />
      </Modal>
    </div>
  );
};

export default PaymentHistory;
```

---

## 🏢 Landlord Components

### 1. Payment Approval Dashboard

**File:** `src/pages/Landlord/PaymentApprovalDashboard.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Tabs,
  Modal,
  Input,
  message,
  Image,
  Descriptions,
  Badge,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileImageOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import paymentService from '../../services/paymentService';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { confirm } = Modal;

const PaymentApprovalDashboard = () => {
  const [activeTab, setActiveTab] = useState('pending_approval');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [evidencePreview, setEvidencePreview] = useState(null);

  useEffect(() => {
    fetchPayments(activeTab);
  }, [activeTab]);

  const fetchPayments = async (status) => {
    setLoading(true);
    try {
      const result = await paymentService.getPaymentsByStatus(status);
      setPayments(result.data);
    } catch (error) {
      message.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedPayment) return;

    try {
      await paymentService.approvePayment(selectedPayment._id, approvalNotes);
      message.success('Payment approved successfully!');
      setApproveModalVisible(false);
      setApprovalNotes('');
      setSelectedPayment(null);
      fetchPayments(activeTab);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to approve payment');
    }
  };

  const handleReject = async () => {
    if (!selectedPayment) return;

    if (!rejectionReason.trim()) {
      message.error('Please provide a rejection reason');
      return;
    }

    try {
      await paymentService.rejectPayment(selectedPayment._id, rejectionReason);
      message.success('Payment rejected');
      setRejectModalVisible(false);
      setRejectionReason('');
      setSelectedPayment(null);
      fetchPayments(activeTab);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to reject payment');
    }
  };

  const showApproveConfirm = (record) => {
    setSelectedPayment(record);
    setApproveModalVisible(true);
  };

  const showRejectModal = (record) => {
    setSelectedPayment(record);
    setRejectModalVisible(true);
  };

  const columns = [
    {
      title: 'Renter Info',
      key: 'renter',
      render: (_, record) => (
        <div>
          <div><strong>{record.renterId?.name}</strong></div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.renterId?.email}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.renterId?.phone}</div>
        </div>
      ),
    },
    {
      title: 'Room',
      dataIndex: ['contractId', 'roomId', 'name'],
      key: 'room',
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'amount',
      render: (amount) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
          {amount?.toLocaleString()} VND
        </span>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag color={type === 'deposit' ? 'gold' : 'blue'}>{type}</Tag>,
    },
    {
      title: 'Uploaded At',
      dataIndex: 'evidenceUploadedAt',
      key: 'uploadedAt',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Evidence',
      dataIndex: 'paymentEvidence',
      key: 'evidence',
      render: (url) => (
        <Button
          type="link"
          icon={<FileImageOutlined />}
          onClick={() => setEvidencePreview(url)}
        >
          View Evidence
        </Button>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => {
        if (activeTab === 'pending_approval') {
          return (
            <Space>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => showApproveConfirm(record)}
              >
                Approve
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => showRejectModal(record)}
              >
                Reject
              </Button>
            </Space>
          );
        }
        if (activeTab === 'rejected' && record.rejectionReason) {
          return (
            <Button
              type="text"
              onClick={() => {
                Modal.info({
                  title: 'Rejection Reason',
                  content: record.rejectionReason,
                });
              }}
            >
              View Reason
            </Button>
          );
        }
        return null;
      },
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Payment Approval Dashboard">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <Badge count={payments.length} offset={[10, 0]}>
                Pending Approval
              </Badge>
            }
            key="pending_approval"
          />
          <TabPane tab="Approved" key="approved" />
          <TabPane tab="Rejected" key="rejected" />
        </Tabs>

        <Table
          columns={columns}
          dataSource={payments}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Approve Modal */}
      <Modal
        title="Approve Payment"
        open={approveModalVisible}
        onOk={handleApprove}
        onCancel={() => {
          setApproveModalVisible(false);
          setApprovalNotes('');
          setSelectedPayment(null);
        }}
        okText="Approve"
        okButtonProps={{ icon: <CheckCircleOutlined /> }}
      >
        {selectedPayment && (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Renter">
                {selectedPayment.renterId?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Amount">
                {selectedPayment.totalAmount?.toLocaleString()} VND
              </Descriptions.Item>
              <Descriptions.Item label="Type">
                {selectedPayment.type}
              </Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 16 }}>
              <label>Notes (Optional):</label>
              <TextArea
                rows={3}
                placeholder="Add approval notes..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
              />
            </div>
          </>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Reject Payment"
        open={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectionReason('');
          setSelectedPayment(null);
        }}
        okText="Reject"
        okButtonProps={{ danger: true, icon: <CloseCircleOutlined /> }}
      >
        {selectedPayment && (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Renter">
                {selectedPayment.renterId?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Amount">
                {selectedPayment.totalAmount?.toLocaleString()} VND
              </Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 16 }}>
              <label>
                Rejection Reason <span style={{ color: 'red' }}>*</span>:
              </label>
              <TextArea
                rows={4}
                placeholder="Please provide a reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
            </div>
          </>
        )}
      </Modal>

      {/* Evidence Preview Modal */}
      <Modal
        title="Payment Evidence"
        open={!!evidencePreview}
        onCancel={() => setEvidencePreview(null)}
        footer={null}
        width={800}
      >
        <Image src={evidencePreview} alt="Payment Evidence" style={{ width: '100%' }} />
      </Modal>
    </div>
  );
};

export default PaymentApprovalDashboard;
```

---

## 🔗 Router Configuration

### File: `src/App.jsx` (Add these routes)

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PaymentHistory from './pages/Renter/PaymentHistory';
import PaymentApprovalDashboard from './pages/Landlord/PaymentApprovalDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Renter Routes */}
        <Route path="/renter/payments" element={<PaymentHistory />} />
        
        {/* Landlord Routes */}
        <Route path="/landlord/payment-approvals" element={<PaymentApprovalDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
```

---

## 🎨 Custom Styles (Optional)

### File: `src/styles/payment.css`

```css
/* Payment Status Colors */
.payment-status-pending {
  color: #faad14;
}

.payment-status-approved {
  color: #52c41a;
}

.payment-status-rejected {
  color: #ff4d4f;
}

.payment-status-overdue {
  color: #ff4d4f;
  font-weight: bold;
}

/* Payment Card */
.payment-card {
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.payment-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
  transition: all 0.3s ease;
}

/* Evidence Preview */
.evidence-preview {
  max-width: 100%;
  border-radius: 8px;
  border: 1px solid #d9d9d9;
}

/* Upload Dragger */
.upload-dragger {
  border: 2px dashed #1890ff !important;
  border-radius: 8px;
}

.upload-dragger:hover {
  border-color: #40a9ff !important;
}
```

---

## 📱 Mobile Responsive Example

### File: `src/components/Renter/PaymentCard.jsx` (Mobile-friendly)

```jsx
import React from 'react';
import { Card, Tag, Button, Space } from 'antd';
import { DollarOutlined, FileImageOutlined } from '@ant-design/icons';
import moment from 'moment';

const PaymentCard = ({ payment, onUploadClick, onViewEvidence }) => {
  const getStatusColor = () => {
    if (payment.status === 'paid') return 'success';
    if (payment.status === 'pending_approval') return 'warning';
    if (payment.status === 'rejected') return 'error';
    return 'default';
  };

  return (
    <Card
      className="payment-card"
      size="small"
      style={{ marginBottom: 16 }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 'bold' }}>
            {payment.totalAmount?.toLocaleString()} VND
          </span>
          <Tag color={getStatusColor()}>{payment.status}</Tag>
        </div>
        
        <div style={{ fontSize: '12px', color: '#666' }}>
          Room: {payment.contractId?.roomId?.name}
        </div>
        
        <div style={{ fontSize: '12px', color: '#666' }}>
          Due: {moment(payment.dueDate).format('DD/MM/YYYY')}
        </div>

        <Space style={{ marginTop: 8 }}>
          {!payment.paymentEvidence && (
            <Button
              type="primary"
              size="small"
              icon={<DollarOutlined />}
              onClick={() => onUploadClick(payment._id)}
            >
              Upload
            </Button>
          )}
          {payment.paymentEvidence && (
            <Button
              type="link"
              size="small"
              icon={<FileImageOutlined />}
              onClick={() => onViewEvidence(payment.paymentEvidence)}
            >
              View Evidence
            </Button>
          )}
        </Space>
      </Space>
    </Card>
  );
};

export default PaymentCard;
```

---

## 🧪 Testing Checklist for Frontend

### ✅ Renter Flow
- [ ] Upload payment evidence for pending bill
- [ ] View uploaded evidence
- [ ] See "Pending Approval" status after upload
- [ ] Receive notification when approved
- [ ] Re-upload after rejection
- [ ] View rejection reason
- [ ] Filter payments by status

### ✅ Landlord Flow
- [ ] View all pending approvals
- [ ] View payment evidence (zoom, download)
- [ ] Approve payment with notes
- [ ] Reject payment with reason
- [ ] View approved payments
- [ ] View rejected payments
- [ ] Badge count updates correctly

### ✅ Error Handling
- [ ] Upload file > 5MB (should show error)
- [ ] Upload invalid file type (should show error)
- [ ] Network error handling
- [ ] Token expiration redirect to login
- [ ] Missing rejection reason validation

---

## 📝 Environment Variables

### File: `.env`

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_MAX_FILE_SIZE=5242880
```

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

---

## 📚 Additional Resources

- **Ant Design Docs:** https://ant.design/components/overview/
- **Axios Docs:** https://axios-http.com/docs/intro
- **React Router:** https://reactrouter.com/

---

**Frontend integration complete!** 🎉 All components are production-ready and follow best practices.
