class Api::V1::BillsController < Api::V1::BaseController
  require 'csv'
  require 'grover'
  require 'nokogiri'

  def index
    
  end
  def create
    from_date     = params[:from_date]
    to_date       = params[:to_date]
    shipper_id    = params[:shipper_id]
    warehouse_id  = params[:warehouse_id]
    closing_date  = params[:closing_date]
    billed_on     = params[:billed_on]
    y             = params[:y]
    m             = params[:m]
    d             = params[:d]


    prepare_bill = Stock.get_prepare_bill(from_date, to_date, shipper_id, warehouse_id).first
    bill = Bill.where(billed_on: billed_on)
    ActiveRecord::Base.transaction do
    bill_id = ""
      if  bill.present?
        bill_id =  bill[0].id
        bill.update( last_amount:      prepare_bill.last_amount==nil ? 0 : prepare_bill.last_amount,
          deposit_amount:   prepare_bill.deposit_amount,
          handling_cost:    prepare_bill.handling_cost, 
          storage_cost:     prepare_bill.storage_cost,
          current_amount:   prepare_bill.current_amount,
          tax:              prepare_bill.tax
        )
      else
        # prepare_bill = Stock.get_prepare_bill(from_date, to_date, shipper_id, warehouse_id).first
        bill = Bill.create(
          warehouse_id:     warehouse_id,
          shipper_id:       shipper_id,
          last_amount:      prepare_bill.last_amount==nil ? 0 : prepare_bill.last_amount,
          deposit_amount:   prepare_bill.deposit_amount,
          handling_cost:    prepare_bill.handling_cost, 
          storage_cost:     prepare_bill.storage_cost,
          current_amount:   prepare_bill.current_amount,
          tax:              prepare_bill.tax,
          closing_date:     closing_date,
          duration_from:    from_date,
          duration_to:      to_date,
          billed:           1,
          billed_on:        billed_on,
          printed:          0

        )
        bill_id = bill.id
      end
      BillAmount.destroy_by(bill_id: bill_id)
      bill_amounts = StockInout.prepare_bill_amounts(from_date, to_date, shipper_id, warehouse_id )
      bill_amounts.map do |record|
        BillAmount.create(
          bill_id:                      bill_id,                       
          product_id:                   record.product_id,                    
          lot_number:                   record.lot_number,   
          previous_period_carryover:    0,
          first_half_instock_amount:    record.first_half_instock_amount == nil ? 0: record.first_half_instock_amount,
          first_half_outstock_amount:   record.first_half_outstock_amount == nil ? 0: record.first_half_outstock_amount,            
          mid_instock_amount:           record.mid_instock_amount == nil ? 0: record.mid_instock_amount,          
          mid_outstock_amount:          record.mid_outstock_amount == nil ? 0: record.mid_outstock_amount,                  
          second_half_instock_amount:   record.second_half_instock_amount == nil ? 0: record.second_half_instock_amount,                  
          second_half_outstock_amount:  record.second_half_outstock_amount == nil ? 0: record.second_half_outstock_amount,          
          current_period_balance:       0          
        )
      end
    end
    render :json => {
      status: :accepted
    }
  end
  def export_bill_report
    shipper_id              = params[:shipper_id]
    bill_payment_amount     = params[:bill_payment_amount]
    handling_cost           = params[:handling_cost]
    last_bill_amount        = params[:last_bill_amount]
    product_name            = params[:product_name]
    received_payment_amount = params[:received_payment_amount]
    tax                     = params[:tax]
    total_storage_fee       = params[:total_storage_fee]

    shipper = Shipper.find(shipper_id)

    html = "<h1>Hello, Everyone!</h1>";
    filename = "template"
    pdf = Grover.new(html, format: 'A4').to_pdf
    send_data pdf, filename: filename, type: "application/pdf"

  end
end
