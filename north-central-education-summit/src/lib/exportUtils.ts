import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';

interface ExportOptions {
  fileName: string;
  sheetName?: string;
  format?: 'xlsx' | 'csv' | 'pdf';
}

interface ReportOptions {
  format: 'excel' | 'pdf' | 'csv';
  template: 'registration' | 'attendance' | 'payment' | 'meal' | 'summary';
  filters?: Record<string, any>;
}

export const exportData = async (data: any[], options: ExportOptions) => {
  try {
    switch (options.format) {
      case 'csv':
        return exportToCSV(data, options);
      case 'pdf':
        return exportToPDF(data, options);
      default:
        return exportToExcel(data, options);
    }
  } catch (error) {
    console.error('Export failed:', error);
    return { success: false, error };
  }
};

const exportToExcel = (data: any[], options: ExportOptions) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, options.sheetName || 'Sheet1');
  
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${options.fileName}.xlsx`);
  
  return { success: true };
};

const exportToCSV = (data: any[], options: ExportOptions) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${options.fileName}.csv`);
  
  return { success: true };
};

const exportToPDF = (data: any[], options: ExportOptions) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text(options.fileName, 14, 15);
  
  // Add timestamp
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 25);
  
  // Convert data to table format
  const headers = Object.keys(data[0]);
  const rows = data.map(item => Object.values(item));
  
  // Add table
  (doc as any).autoTable({
    head: [headers],
    body: rows,
    startY: 30,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 139, 202] },
  });
  
  // Save PDF
  doc.save(`${options.fileName}.pdf`);
  
  return { success: true };
};

export const formatAttendanceReport = (data: any[]) => {
  return data.map(record => ({
    'Event': record.events?.title || '',
    'Attendee Name': record.profiles?.full_name || '',
    'Email': record.profiles?.email || '',
    'Phone': record.profiles?.phone || '',
    'State': record.profiles?.state || '',
    'Chapter': record.profiles?.chapter || '',
    'Check-in Time': record.check_in_time ? new Date(record.check_in_time).toLocaleString() : 'Not Checked In',
    'Check-in Status': record.check_in_time ? 'Checked In' : 'Not Checked In',
    'Registration ID': record.registration_id || '',
  }));
};

export const formatPaymentReport = (data: any[]) => {
  return data.map(payment => ({
    'Event': payment.events?.title || '',
    'Attendee Name': payment.profiles?.full_name || '',
    'Email': payment.profiles?.email || '',
    'Phone': payment.profiles?.phone || '',
    'Amount': payment.amount ? `₦${payment.amount.toLocaleString()}` : '',
    'Payment Date': payment.payment_date ? new Date(payment.payment_date).toLocaleString() : '',
    'Payment Status': payment.status || '',
    'Payment Method': payment.method || '',
    'Payment Reference': payment.reference || '',
    'Transaction ID': payment.transaction_id || '',
  }));
};

export const formatRegistrationReport = (data: any[]) => {
  return data.map(registration => ({
    'Event': registration.events?.title || '',
    'Attendee Name': registration.profiles?.full_name || '',
    'Email': registration.profiles?.email || '',
    'Phone': registration.profiles?.phone || '',
    'State': registration.profiles?.state || '',
    'Chapter': registration.profiles?.chapter || '',
    'Registration Date': registration.created_at ? new Date(registration.created_at).toLocaleString() : '',
    'Status': registration.status || '',
    'Payment Status': registration.payments?.status || 'No Payment',
    'Registration ID': registration.registration_id || '',
    'Accredited': registration.accredited ? 'Yes' : 'No',
    'Accredited At': registration.accredited_at ? new Date(registration.accredited_at).toLocaleString() : '',
  }));
};

export const formatMealReport = (data: any[]) => {
  return data.map(validation => ({
    'Event': validation.events?.title || '',
    'Attendee Name': validation.profiles?.full_name || '',
    'Registration ID': validation.registration_id || '',
    'Meal Type': validation.meal_sessions?.type || '',
    'Validation Time': validation.validated_at ? new Date(validation.validated_at).toLocaleString() : '',
    'Validated By': validation.validator?.full_name || '',
    'State': validation.profiles?.state || '',
    'Chapter': validation.profiles?.chapter || '',
  }));
};

export const formatEventReport = (data: any[]) => {
  return data.map(event => ({
    'Event Title': event.title || '',
    'Start Date': event.start_date ? new Date(event.start_date).toLocaleString() : '',
    'End Date': event.end_date ? new Date(event.end_date).toLocaleString() : '',
    'Location': event.location || '',
    'Total Registrations': event.registrations_count || 0,
    'Confirmed Registrations': event.confirmed_registrations_count || 0,
    'Total Revenue': event.total_revenue ? `₦${event.total_revenue.toLocaleString()}` : '₦0',
    'Average Attendance': event.average_attendance || '0%',
  }));
};

export const generateReport = async (data: any[], options: ReportOptions): Promise<Buffer | string> => {
  switch (options.template) {
    case 'registration':
      return generateRegistrationReport(data, options);
    case 'attendance':
      return generateAttendanceReport(data, options);
    case 'payment':
      return generatePaymentReport(data, options);
    case 'meal':
      return generateMealReport(data, options);
    case 'summary':
      return generateSummaryReport(data, options);
    default:
      throw new Error('Invalid report template');
  }
};

const generateRegistrationReport = async (data: any[], options: ReportOptions) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Registrations');

  // Set up columns
  worksheet.columns = [
    { header: 'Registration ID', key: 'registration_id', width: 15 },
    { header: 'Full Name', key: 'full_name', width: 30 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Phone', key: 'phone', width: 15 },
    { header: 'State', key: 'state', width: 15 },
    { header: 'Chapter', key: 'chapter', width: 20 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Payment Status', key: 'payment_status', width: 15 },
    { header: 'Registration Date', key: 'created_at', width: 20 }
  ];

  // Add data
  data.forEach(item => {
    worksheet.addRow({
      registration_id: item.registration_id,
      full_name: item.profiles.full_name,
      email: item.profiles.email,
      phone: item.profiles.phone,
      state: item.profiles.state,
      chapter: item.profiles.chapter,
      status: item.status,
      payment_status: item.payments[0]?.status || 'pending',
      created_at: format(new Date(item.created_at), 'yyyy-MM-dd HH:mm:ss')
    });
  });

  // Style the worksheet
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  return await workbook.xlsx.writeBuffer();
};

const generateAttendanceReport = async (data: any[], options: ReportOptions) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Attendance');

  // Set up columns
  worksheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Event', key: 'event', width: 30 },
    { header: 'Full Name', key: 'full_name', width: 30 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'State', key: 'state', width: 15 },
    { header: 'Check-in Time', key: 'check_in', width: 20 },
    { header: 'Check-out Time', key: 'check_out', width: 20 }
  ];

  // Add data
  data.forEach(item => {
    worksheet.addRow({
      date: format(new Date(item.date), 'yyyy-MM-dd'),
      event: item.event_title,
      full_name: item.profiles.full_name,
      email: item.profiles.email,
      state: item.profiles.state,
      check_in: item.check_in ? format(new Date(item.check_in), 'HH:mm:ss') : '-',
      check_out: item.check_out ? format(new Date(item.check_out), 'HH:mm:ss') : '-'
    });
  });

  // Style the worksheet
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  return await workbook.xlsx.writeBuffer();
};

const generatePaymentReport = async (data: any[], options: ReportOptions) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Payments');

  // Set up columns
  worksheet.columns = [
    { header: 'Payment ID', key: 'payment_id', width: 15 },
    { header: 'Registration ID', key: 'registration_id', width: 15 },
    { header: 'Full Name', key: 'full_name', width: 30 },
    { header: 'Amount', key: 'amount', width: 15 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Payment Date', key: 'payment_date', width: 20 },
    { header: 'Reference', key: 'reference', width: 30 }
  ];

  // Add data
  data.forEach(item => {
    worksheet.addRow({
      payment_id: item.id,
      registration_id: item.registration_id,
      full_name: item.profiles.full_name,
      amount: item.amount,
      status: item.status,
      payment_date: item.payment_date ? format(new Date(item.payment_date), 'yyyy-MM-dd HH:mm:ss') : '-',
      reference: item.payment_reference
    });
  });

  // Style the worksheet
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Format amount column
  worksheet.getColumn('amount').numFmt = '#,##0.00';

  return await workbook.xlsx.writeBuffer();
};

const generateMealReport = async (data: any[], options: ReportOptions) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Meal Validations');

  // Set up columns
  worksheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Meal Type', key: 'type', width: 15 },
    { header: 'Full Name', key: 'full_name', width: 30 },
    { header: 'Registration ID', key: 'registration_id', width: 15 },
    { header: 'State', key: 'state', width: 15 },
    { header: 'Validation Time', key: 'validation_time', width: 20 },
    { header: 'Validator', key: 'validator', width: 30 },
    { header: 'Location', key: 'location', width: 20 }
  ];

  // Add data
  data.forEach(item => {
    worksheet.addRow({
      date: format(new Date(item.meal_sessions.date), 'yyyy-MM-dd'),
      type: item.meal_sessions.type,
      full_name: item.profiles.full_name,
      registration_id: item.registration_id,
      state: item.profiles.state,
      validation_time: format(new Date(item.validation_time), 'HH:mm:ss'),
      validator: item.validator?.full_name || '-',
      location: item.location || '-'
    });
  });

  // Style the worksheet
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  return await workbook.xlsx.writeBuffer();
};

const generateSummaryReport = async (data: any[], options: ReportOptions) => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(16);
  doc.text('Event Summary Report', 14, 15);
  doc.setFontSize(12);
  doc.text(`Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`, 14, 25);

  // Registration Statistics
  doc.setFontSize(14);
  doc.text('Registration Statistics', 14, 40);
  doc.autoTable({
    startY: 45,
    head: [['Metric', 'Count']],
    body: [
      ['Total Registrations', data.totalRegistrations],
      ['Pending Registrations', data.pendingRegistrations],
      ['Confirmed Registrations', data.confirmedRegistrations],
      ['Cancelled Registrations', data.cancelledRegistrations]
    ]
  });

  // Payment Statistics
  doc.setFontSize(14);
  doc.text('Payment Statistics', 14, doc.lastAutoTable.finalY + 15);
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 20,
    head: [['Metric', 'Amount']],
    body: [
      ['Total Revenue', `₦${data.totalRevenue.toLocaleString()}`],
      ['Pending Payments', `₦${data.pendingPayments.toLocaleString()}`],
      ['Failed Payments', `₦${data.failedPayments.toLocaleString()}`]
    ]
  });

  // Attendance Statistics
  doc.setFontSize(14);
  doc.text('Attendance Statistics', 14, doc.lastAutoTable.finalY + 15);
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 20,
    head: [['Event', 'Registered', 'Attended', 'Percentage']],
    body: data.eventStats.map(event => [
      event.title,
      event.registered,
      event.attended,
      `${((event.attended / event.registered) * 100).toFixed(1)}%`
    ])
  });

  // State-wise Distribution
  doc.setFontSize(14);
  doc.text('State-wise Distribution', 14, doc.lastAutoTable.finalY + 15);
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 20,
    head: [['State', 'Participants']],
    body: data.stateStats.map(state => [
      state.name,
      state.count
    ])
  });

  return doc.output('arraybuffer');
};

export const downloadReport = async (buffer: Buffer | string, filename: string, format: 'excel' | 'pdf' | 'csv') => {
  const blob = new Blob([buffer], {
    type: format === 'excel'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : format === 'pdf'
        ? 'application/pdf'
        : 'text/csv'
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.${format === 'excel' ? 'xlsx' : format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
