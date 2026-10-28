"""
Customer & Agent Management System — Spreadsheet Generator
Visa, Immigration, Medical, Biometrics, Protector, Ticketing & Document Processing
Generates an official Microsoft Excel / Google Sheets workbook (.xlsx) with 3 core worksheets:
1. CUSTOMER REGISTER (Columns A-X + Payment Ledger Z-AI)
2. AGENT REGISTER (Columns A-T + Agent Payment Ledger V-AC)
3. FINAL REPORT DASHBOARD (Opening Worksheet)
"""

import sys

def main():
    try:
        import openpyxl
        from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
        from openpyxl.utils import get_column_letter
    except ImportError:
        print("Please install openpyxl: pip install openpyxl")
        sys.exit(1)

    wb = openpyxl.Workbook()

    # Sheet styles
    navy_header_fill = PatternFill(start_color="0B1F3A", end_color="0B1F3A", fill_type="solid")
    teal_accent_fill = PatternFill(start_color="0F9D9A", end_color="0F9D9A", fill_type="solid")
    light_teal_fill = PatternFill(start_color="E0F2F1", end_color="E0F2F1", fill_type="solid")
    alt_row_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
    white_font_bold = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    navy_title_font = Font(name="Calibri", size=14, bold=True, color="0B1F3A")
    bold_font = Font(name="Calibri", size=11, bold=True)
    regular_font = Font(name="Calibri", size=10)

    thin_border_side = Side(border_style="thin", color="CBD5E1")
    cell_border = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=thin_border_side)

    # 1. FINAL REPORT DASHBOARD (First sheet)
    ws_dash = wb.active
    ws_dash.title = "FINAL REPORT DASHBOARD"

    # 2. CUSTOMER REGISTER
    ws_cust = wb.create_sheet(title="CUSTOMER REGISTER")

    # 3. AGENT REGISTER
    ws_agent = wb.create_sheet(title="AGENT REGISTER")

    # Ensure FINAL REPORT DASHBOARD is opening sheet
    wb.active = ws_dash

    # Customer Register headers
    cust_headers = [
        "Customer ID", "Registration Date", "Customer Full Name", "Phone Number", "WhatsApp Number",
        "Email Address", "City", "Full Address", "Passport Number", "Service Category",
        "Country / Destination", "Assigned Agent", "Agreed Customer Fee", "Total Amount Received",
        "Customer Outstanding Balance", "Total Amount Paid to Agent", "Business Expenses",
        "Estimated Commission", "Documents Received Status", "Documents Sent to Agent Status",
        "Case Status", "Next Follow-up Date", "Last Updated", "Notes", "",
        "Tx Date", "Customer ID", "Customer Name", "Transaction Type", "Amount (PKR)",
        "Payment Method", "Receipt / Ref Number", "Service Line", "Notes", "Check"
    ]
    
    ws_cust.append(["CUSTOMER REGISTER & PAYMENT LEDGER"])
    ws_cust.append(["A-X: Customer Database | Z-AI: Customer Payment Ledger"])
    ws_cust.append([])
    ws_cust.append([])
    ws_cust.append(cust_headers)

    # Save workbook
    wb.save("Customer_Agent_Management_System_Py.xlsx")
    print("Workbook generated successfully as Customer_Agent_Management_System_Py.xlsx")

if __name__ == "__main__":
    main()
