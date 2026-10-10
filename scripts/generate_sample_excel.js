import * as XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('--- Generating Master Indian Procurement Sample Excel Workbook ---')

const vendorsData = [
  {
    'Vendor Code': 'VND-001',
    'Company Legal Name *': 'Tata Steel BSL Limited',
    'Trade Category': 'Structural Steel & Heavy Alloys',
    'Vendor Type': 'Manufacturer',
    'Official Email *': 'b2b.sales@tatasteel.com',
    'Contact Phone': '+91-22-6665-8282',
    'City': 'Mumbai, Maharashtra',
    'Country': 'India',
    'Credit Terms': 'Net 30',
    'Tax ID / GSTIN': '27AAACT2727Q1ZW',
    'Primary Contact Person': 'Rajesh Nair',
    'Bank Name': 'State Bank of India',
    'Bank Account No': '40918239012',
  },
  {
    'Vendor Code': 'VND-002',
    'Company Legal Name *': 'Larsen & Toubro Electrical & Automation Ltd',
    'Trade Category': 'Switchgear & Industrial Automation',
    'Vendor Type': 'Manufacturer',
    'Official Email *': 'orders.ea@larsentoubro.com',
    'Contact Phone': '+91-265-245-1200',
    'City': 'Vadodara, Gujarat',
    'Country': 'India',
    'Credit Terms': 'Net 45',
    'Tax ID / GSTIN': '24AAACL0140P1ZT',
    'Primary Contact Person': 'Ananya Deshmukh',
    'Bank Name': 'HDFC Bank',
    'Bank Account No': '5020008819201',
  },
  {
    'Vendor Code': 'VND-003',
    'Company Legal Name *': 'Kirloskar Brothers Limited',
    'Trade Category': 'Industrial Pumps, Valves & Flow Control',
    'Vendor Type': 'Manufacturer',
    'Official Email *': 'corporate.sales@kbl.co.in',
    'Contact Phone': '+91-20-2721-4000',
    'City': 'Pune, Maharashtra',
    'Country': 'India',
    'Credit Terms': 'Net 30',
    'Tax ID / GSTIN': '27AAACK1188D1Z2',
    'Primary Contact Person': 'Milind Joshi',
    'Bank Name': 'ICICI Bank',
    'Bank Account No': '003905001188',
  },
  {
    'Vendor Code': 'VND-004',
    'Company Legal Name *': 'Indian Oil Corporation Ltd (Lubricants Division)',
    'Trade Category': 'Industrial Lubricants & Petroleum',
    'Vendor Type': 'Public Sector Undertaking',
    'Official Email *': 'servolubes@indianoil.in',
    'Contact Phone': '+91-22-2644-7611',
    'City': 'Mumbai, Maharashtra',
    'Country': 'India',
    'Credit Terms': 'Net 30',
    'Tax ID / GSTIN': '27AAACI1681G1ZM',
    'Primary Contact Person': 'Sandeep Verma',
    'Bank Name': 'Punjab National Bank',
    'Bank Account No': '112000210089',
  },
]

const purchaseOrdersData = [
  {
    'PO Number': 'PO-2026-00441',
    'Vendor Code or Name *': 'Tata Steel BSL Limited',
    'PO Type': 'Single',
    'Order Date': '2026-10-12',
    'Expected Delivery Date *': '2026-11-05',
    'Payment Terms': 'Net 30',
    'Item Description *': 'Tata Structura MS Hollow Sections (IS 2062 E250BR, 150x150x6mm)',
    'Quantity *': 50,
    'Unit Price (₹) *': 4850,
    'GST Rate (%)': 18,
    'Order Notes': 'Deliver directly to Bay 4 Receiving Dock, Pune Plant 102. Mill Test Certificate mandatory.',
  },
  {
    'PO Number': 'PO-2026-00442',
    'Vendor Code or Name *': 'Larsen & Toubro Electrical & Automation Ltd',
    'PO Type': 'Multi',
    'Order Date': '2026-10-14',
    'Expected Delivery Date *': '2026-11-12',
    'Payment Terms': 'Net 45',
    'Item Description *': 'L&T Heavy Duty Variable Frequency Drive (VFD 45kW / 415V 3-Phase)',
    'Quantity *': 4,
    'Unit Price (₹) *': 142000,
    'GST Rate (%)': 18,
    'Order Notes': 'Ship via registered express carrier to Bengaluru Tech Hub. Mark crates with PO-2026-00442.',
  },
  {
    'PO Number': 'PO-2026-00443',
    'Vendor Code or Name *': 'Kirloskar Brothers Limited',
    'PO Type': 'Single',
    'Order Date': '2026-10-15',
    'Expected Delivery Date *': '2026-11-01',
    'Payment Terms': 'Net 30',
    'Item Description *': 'Kirloskar End Suction Industrial Centrifugal Pump (Model DB 65/26)',
    'Quantity *': 3,
    'Unit Price (₹) *': 88500,
    'GST Rate (%)': 18,
    'Order Notes': 'Delivery to Chennai Hub Central Stores. Include motor test certificates and warranty card.',
  },
  {
    'PO Number': 'PO-2026-00444',
    'Vendor Code or Name *': 'Indian Oil Corporation Ltd (Lubricants Division)',
    'PO Type': 'Single',
    'Order Date': '2026-10-16',
    'Expected Delivery Date *': '2026-11-08',
    'Payment Terms': 'Net 30',
    'Item Description *': 'Servo System 68 Anti-Wear Hydraulic Fluid (210L Steel Barrel - IOCL)',
    'Quantity *': 4,
    'Unit Price (₹) *': 38400,
    'GST Rate (%)': 18,
    'Order Notes': 'Deliver 4 sealed drums to Lubricants Basement Storage, Pune Works.',
  },
]

const requisitionsData = [
  {
    'PR Number': 'PR-2026-00101',
    'Requisition Title *': 'Urgent Structural Steel Hollow Sections for Line 4 Expansion',
    'Department / Cost Center *': 'Manufacturing Operations',
    'Priority': 'HIGH',
    'Item Description *': 'Tata Structura MS Hollow Sections (IS 2062 E250BR, 150x150x6mm)',
    'Quantity *': 50,
    'Est. Unit Price (₹) *': 4850,
    'Unit of Measure': 'MTR',
    'Required By Date *': '2026-10-30',
    'Procurement Purpose': 'Line 4 structural mezzanine fabrication scheduled for mid-month. Approved under Q1 capital budget.',
  },
  {
    'PR Number': 'PR-2026-00102',
    'Requisition Title *': 'L&T 45kW VFD Units for Chiller Plant Energy Optimization',
    'Department / Cost Center *': 'Automation & Instrumentation',
    'Priority': 'MEDIUM',
    'Item Description *': 'L&T Heavy Duty Variable Frequency Drive (VFD 45kW / 415V 3-Phase)',
    'Quantity *': 4,
    'Est. Unit Price (₹) *': 142000,
    'Unit of Measure': 'EA',
    'Required By Date *': '2026-11-10',
    'Procurement Purpose': 'Replacement of older rewound motors with energy efficient VFD speed drives in plant chiller room.',
  },
  {
    'PR Number': 'PR-2026-00103',
    'Requisition Title *': 'Kirloskar DB 65/26 Centrifugal Pump Sets for ETP Plant',
    'Department / Cost Center *': 'Facilities & Logistics',
    'Priority': 'HIGH',
    'Item Description *': 'Kirloskar End Suction Industrial Centrifugal Pump (Model DB 65/26)',
    'Quantity *': 3,
    'Est. Unit Price (₹) *': 88500,
    'Unit of Measure': 'SET',
    'Required By Date *': '2026-10-25',
    'Procurement Purpose': 'Effluent treatment plant pump refurbishment for state pollution control board compliance audit.',
  },
  {
    'PR Number': 'PR-2026-00104',
    'Requisition Title *': 'Servo System 68 Anti-Wear Hydraulic Fluid Barrels Replenishment',
    'Department / Cost Center *': 'Manufacturing Operations',
    'Priority': 'MEDIUM',
    'Item Description *': 'Servo System 68 Anti-Wear Hydraulic Fluid (210L Steel Barrel - IOCL)',
    'Quantity *': 4,
    'Est. Unit Price (₹) *': 38400,
    'Unit of Measure': 'DRUM',
    'Required By Date *': '2026-11-05',
    'Procurement Purpose': 'Scheduled semi-annual hydraulic oil change for hydraulic presses 1 through 4.',
  },
]

const itemsData = [
  {
    'Item Code *': 'ITM-IS2062-E250',
    'Item Name & Specification *': 'Tata Structura MS Hollow Sections & Heavy Beams (IS 2062 E250BR)',
    'Category': 'Structural Steel & Heavy Alloys',
    'Unit of Measure *': 'MTR',
    'Standard Price (₹) *': 4850,
    'Min Safety Stock': 25,
    'Current Warehouse Stock': 80,
    'Technical Details': 'Hot rolled high-strength structural steel square hollow section (150x150x6mm, 6m length) certified to IS 2062',
  },
  {
    'Item Code *': 'ITM-LNT-VFD',
    'Item Name & Specification *': 'L&T Heavy Duty Variable Frequency Drive (VFD 45kW / 415V 3-Phase)',
    'Category': 'Switchgear, Electrical & Instrumentation',
    'Unit of Measure *': 'EA',
    'Standard Price (₹) *': 142000,
    'Min Safety Stock': 5,
    'Current Warehouse Stock': 14,
    'Technical Details': 'Larsen & Toubro Sx2000 series 45kW AC drive with built-in EMC filter, RS-485 Modbus, IP55 rugged enclosure',
  },
  {
    'Item Code *': 'ITM-KBL-PUMP',
    'Item Name & Specification *': 'Kirloskar End Suction Industrial Centrifugal Pump (Model DB 65/26)',
    'Category': 'Industrial Pumps, Valves & Flow Control',
    'Unit of Measure *': 'SET',
    'Standard Price (₹) *': 88500,
    'Min Safety Stock': 3,
    'Current Warehouse Stock': 8,
    'Technical Details': 'Heavy duty back pull-out centrifugal water pump with high-efficiency IE3 motor, bronze impeller, 120 m3/hr flow',
  },
  {
    'Item Code *': 'ITM-IOCL-VG68',
    'Item Name & Specification *': 'Servo System 68 Anti-Wear Hydraulic Fluid (210L Steel Barrel - IOCL)',
    'Category': 'Industrial Lubricants & Consumables',
    'Unit of Measure *': 'DRUM',
    'Standard Price (₹) *': 38400,
    'Min Safety Stock': 15,
    'Current Warehouse Stock': 45,
    'Technical Details': 'Indian Oil SERVO SYSTEM 68 high viscosity index anti-wear hydraulic oil conforming to IS 10522:1983 standards',
  },
]

const goodsReceiptsData = [
  {
    'GRN Number': 'GRN-2026-00219',
    'PO Reference Number *': 'PO-2026-00441',
    'Vendor Name': 'Tata Steel BSL Limited',
    'Delivery Challan / Note No *': 'DC-TATA-44102',
    'Carrier / Vehicle No': 'MH-12-RN-8821',
    'Receipt Date': '2026-10-10',
    'Received Item Description *': 'Tata Structura MS Hollow Sections (IS 2062 E250BR, 150x150x6mm)',
    'Quantity Received *': 50,
    'Inspection Notes': 'All 50 meters structural hollow sections inspected, gauge verified, mill test cert logged.',
  },
  {
    'GRN Number': 'GRN-2026-00220',
    'PO Reference Number *': 'PO-2026-00442',
    'Vendor Name': 'Larsen & Toubro Electrical & Automation Ltd',
    'Delivery Challan / Note No *': 'DC-LT-99120',
    'Carrier / Vehicle No': 'GJ-06-TT-5021',
    'Receipt Date': '2026-10-09',
    'Received Item Description *': 'L&T Heavy Duty Variable Frequency Drive (VFD 45kW / 415V 3-Phase)',
    'Quantity Received *': 4,
    'Inspection Notes': '4 VFD panels received intact in original moisture-barrier packaging. Serial numbers recorded.',
  },
  {
    'GRN Number': 'GRN-2026-00221',
    'PO Reference Number *': 'PO-2026-00443',
    'Vendor Name': 'Kirloskar Brothers Limited',
    'Delivery Challan / Note No *': 'DC-KBL-77401',
    'Carrier / Vehicle No': 'MH-14-AZ-6619',
    'Receipt Date': '2026-10-11',
    'Received Item Description *': 'Kirloskar End Suction Industrial Centrifugal Pump (Model DB 65/26)',
    'Quantity Received *': 3,
    'Inspection Notes': '3 pump skids unloaded at Chennai stores. Impeller rotation checked freely by mechanical engineer.',
  },
  {
    'GRN Number': 'GRN-2026-00222',
    'PO Reference Number *': 'PO-2026-00444',
    'Vendor Name': 'Indian Oil Corporation Ltd (Lubricants Division)',
    'Delivery Challan / Note No *': 'DC-IOCL-8812',
    'Carrier / Vehicle No': 'MH-04-KA-3129',
    'Receipt Date': '2026-10-12',
    'Received Item Description *': 'Servo System 68 Anti-Wear Hydraulic Fluid (210L Steel Barrel - IOCL)',
    'Quantity Received *': 4,
    'Inspection Notes': '4 sealed drums inspected with IOCL tamper-proof seals intact. Batch number SERVO-26-04.',
  },
]

const invoicesData = [
  {
    'Invoice Number *': 'INV-2026-9041',
    'PO Reference Number *': 'PO-2026-00441',
    'Vendor Name': 'Tata Steel BSL Limited',
    'Invoice Date': '2026-10-08',
    'Payment Due Date': '2026-11-07',
    'Subtotal Amount (₹) *': 242500,
    'GST Amount (₹)': 43650,
    'Total Invoiced Amount (₹) *': 286150,
    'Payment Terms': 'Net 30',
  },
  {
    'Invoice Number *': 'INV-2026-9042',
    'PO Reference Number *': 'PO-2026-00442',
    'Vendor Name': 'Larsen & Toubro Electrical & Automation Ltd',
    'Invoice Date': '2026-10-09',
    'Payment Due Date': '2026-11-23',
    'Subtotal Amount (₹) *': 568000,
    'GST Amount (₹)': 102240,
    'Total Invoiced Amount (₹) *': 670240,
    'Payment Terms': 'Net 45',
  },
  {
    'Invoice Number *': 'INV-2026-9043',
    'PO Reference Number *': 'PO-2026-00443',
    'Vendor Name': 'Kirloskar Brothers Limited',
    'Invoice Date': '2026-10-10',
    'Payment Due Date': '2026-11-09',
    'Subtotal Amount (₹) *': 265500,
    'GST Amount (₹)': 47790,
    'Total Invoiced Amount (₹) *': 313290,
    'Payment Terms': 'Net 30',
  },
  {
    'Invoice Number *': 'INV-2026-9044',
    'PO Reference Number *': 'PO-2026-00444',
    'Vendor Name': 'Indian Oil Corporation Ltd (Lubricants Division)',
    'Invoice Date': '2026-10-11',
    'Payment Due Date': '2026-11-10',
    'Subtotal Amount (₹) *': 153600,
    'GST Amount (₹)': 27648,
    'Total Invoiced Amount (₹) *': 181248,
    'Payment Terms': 'Net 30',
  },
]

const wb = XLSX.utils.book_new()

const addSheet = (data, sheetName) => {
  const ws = XLSX.utils.json_to_sheet(data)
  // Auto col width
  const keys = Object.keys(data[0] || {})
  ws['!cols'] = keys.map((k) => ({
    wch: Math.max(k.length + 4, 18),
  }))
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
}

addSheet(vendorsData, 'Vendors')
addSheet(purchaseOrdersData, 'Purchase Orders')
addSheet(requisitionsData, 'Purchase Requisitions')
addSheet(itemsData, 'Item Master')
addSheet(goodsReceiptsData, 'Goods Receipts')
addSheet(invoicesData, 'Supplier Invoices')

// Add Readme / Guide sheet
const guideData = [
  ['SLT PROCUREMENT SUITE — SAMPLE INDIAN PROCUREMENT WORKBOOK'],
  ['Version: 1.0 (Indian Industrial Procurement Edition)'],
  ['Date: October 2026'],
  [],
  ['Sheet Name', 'Module Target', 'Sample Records', 'Primary Indian Entities Included'],
  ['Vendors', 'Vendors & Suppliers', '4 Records', 'Tata Steel BSL, L&T Electrical, Kirloskar Brothers, Indian Oil Corporation'],
  ['Purchase Orders', 'Purchase Orders', '4 Records', 'Structural Steel, 45kW VFD Drives, DB 65/26 Pumps, Servo System 68 Barrels'],
  ['Purchase Requisitions', 'Purchase Requisitions', '4 Records', 'Pune Plant 102, Bengaluru Tech Hub, Chennai Hub, Central QA Lab'],
  ['Item Master', 'Item Master Catalog', '4 Records', 'IS 2062 E250 Beams, L&T Sx2000 VFD, KBL Centrifugal Pump, Servo 68 Oil'],
  ['Goods Receipts', 'Goods Receipt Notes (GRN)', '4 Records', 'Vehicle Nos: MH-12-RN-8821, GJ-06-TT-5021, MH-14-AZ-6619, MH-04-KA-3129'],
  ['Supplier Invoices', 'Supplier Invoices & 3-Way Match', '4 Records', 'Tax Invoices with 18% GST (CGST/SGST/IGST) and 3-Way Matched References'],
  [],
  ['Instructions for Application Import:'],
  ['1. You can upload this entire workbook directly to ANY module import screen.'],
  ['2. The application automatically detects and imports the corresponding sheet for that module.'],
  ['3. You can also modify rows or add new rows and upload for batch onboarding.'],
]

const wsGuide = XLSX.utils.aoa_to_sheet(guideData)
wsGuide['!cols'] = [{ wch: 24 }, { wch: 32 }, { wch: 18 }, { wch: 75 }]
XLSX.utils.book_append_sheet(wb, wsGuide, 'Workbook Guide')

const publicDir = path.resolve(__dirname, '../public')
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

const file1 = path.join(publicDir, 'SLT_Indian_Procurement_Sample_Data.xlsx')
const file2 = path.join(publicDir, 'SLT_Sample_Data.xlsx')

XLSX.writeFile(wb, file1)
XLSX.writeFile(wb, file2)

console.log(`✓ Created: ${file1}`)
console.log(`✓ Created: ${file2}`)
console.log('Successfully generated sample Excel files with 4 records per sheet!')
