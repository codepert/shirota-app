class Api::V1::BillsController < Api::V1::BaseController
  require 'csv'
  require 'grover'
  require 'nokogiri'
  require 'date'
  
  before_action :authenticate_user!
  set_pagination_callback :bill, [:index]
  
  include PdfRender
  include ActionController::MimeResponds # API モードで respond_to を使うために必要

  def index
    from_date = params[:from_date]
    to_date = params[:to_date]
    warehouse_id = params[:warehouse_id]
    shipper_id = params[:shipper_id]


      search = Bill.ransack(
        shipper_id:     shipper_id,
        warehouse_id:   warehouse_id,
        duration_from:  from_date,
        duration_to:    to_date
      )
    
    @bill = search.result.paginate(pagination_params)

    render json: BillsSerializer.new(@bill)

  end
  def create
    from_date     = params[:from_date]
    to_date       = params[:to_date]
    shipper_id    = params[:shipper_id]
    warehouse_id  = params[:warehouse_id]
    closing_date  = params[:closing_date]
    billed_on = Date.today.strftime("%Y-%m-%d")

    if Bill.where("duration_from='#{from_date}' AND duration_to='#{to_date}'").length > 0
      render :json => {
        status: 'error'
      }
      return;
    end
    prepare_bills = Stock.get_uncalc_bills(from_date, to_date)
    ActiveRecord::Base.transaction do
      prepare_bills.map do |prepare_bill|
      
        if closing_date == 20
          prepare_bill_amounts    = Stock.prepare_bill_amounts_20(from_date, to_date, nil, warehouse_id)
        else
          prepare_bill_amounts    = Stock.prepare_bill_amounts(from_date, to_date, nil, warehouse_id)
        end

        current_bill_amount = prepare_bill['current_bill_amount'] == nil ? 0 : prepare_bill['current_bill_amount']

        
        bill = Bill.create(
          shipper_id:           shipper_id,
          warehouse_id:         warehouse_id,
          last_amount:          prepare_bill['previous_bill_amount'] == nil ? 0 : prepare_bill['previous_bill_amount'],
          deposit_amount:       prepare_bill['deposit_amount'] == nil ? 0 : prepare_bill['deposit_amount'],
          handling_cost:        prepare_bill['handle_cost'] == nil ? 0 : prepare_bill['handle_cost'],
          storage_cost:         prepare_bill['storage_cost'] == nil ? 0 : prepare_bill['storage_cost'],
          current_amount:       prepare_bill['current_bill_amount'] == nil ? 0 : prepare_bill['current_bill_amount'],
          tax:                  (current_bill_amount*0.1),
          duration_from:        from_date,
          duration_to:          to_date,
          billed_on:            billed_on,
          closing_date:         closing_date,
          billed:               1,
          processing_cnt:       prepare_bill_amounts.length
        )

        ReceivedPayment.where("received_on BETWEEN '#{from_date}' AND '#{to_date}'")
                      .update(processing_on: Time.now)

        prepare_bill_amounts.map do |record|
          BillAmount.create(
            bill_id:                      bill['id'] ,
            product_id:                   record.product_id,                    
            lot_number:                   record.lot_number,   
            previous_stock_amount:        record.previous_stock_amount == nil ? 0: record.previous_stock_amount,
            first_half_instock_amount:    record.first_half_instock_amount == nil ? 0: record.first_half_instock_amount,
            first_half_outstock_amount:   record.first_half_outstock_amount == nil ? 0: record.first_half_outstock_amount,            
            mid_instock_amount:           record.mid_instock_amount == nil ? 0: record.mid_instock_amount,          
            mid_outstock_amount:          record.mid_outstock_amount == nil ? 0: record.mid_outstock_amount,                  
            second_half_instock_amount:   record.second_half_instock_amount == nil ? 0: record.second_half_instock_amount,                  
            second_half_outstock_amount:  record.second_half_outstock_amount == nil ? 0: record.second_half_outstock_amount,          
            current_stock_amount:         record.current_stock_amount == nil ? 0 : record.current_stock_amount,     
            total_inout_stock_amount:     record.total_inout_stock_amount == nil ? 0 : record.total_inout_stock_amount,     
            storage_fee_rate:             record.storage_fee_rate == nil ? 0 : record.storage_fee_rate,
            instock_handle_fee_rate:      record.instock_handle_fee_rate == nil ? 0 : record.instock_handle_fee_rate,
            outstock_handle_fee_rate:     record.outstock_handle_fee_rate == nil ? 0 : record.outstock_handle_fee_rate
          )
          stockInout = StockInout.where(stock_id: record.stock_id)

          if stockInout.present?
            stockInout.update(is_billed: 1)
          end
        end
      end
    end
    render :json => {
      status: :accepted
    }
  end
  def last_bill_date
    warehouse_id = params[:warehouse_id]
    shipper_id = params[:shipper_id]
    last_bill = Bill.where(billed: 1, warehouse_id: warehouse_id, shipper_id:shipper_id).desc
    last_bill_date = ""
    if last_bill.present?
      last_bill_date = last_bill[0].created_at
    end
    render :json => {
      date: last_bill_date
    }, status: :ok
  end
  def export_bill_report
    bill_id   = params[:id]
    from_date = params[:from_date]
    to_date   = params[:to_date]
    bill = Bill.with_shipper_by_id(bill_id).first
    manangementInfo = ManagementInfo.all.first

    sum_amount = bill.handling_cost + bill.storage_cost + bill.deposit_amount
    billed_on = bill.billed_on
    billed_on_str = billed_on.to_s[0,4] + "年" + billed_on.to_s[5,2] + "月" + billed_on.to_s[8,2] + "日"
    year_last_two_digits = billed_on.to_s[2, 2]

    # doc = Nokogiri::HTML(html)
    # doc.encoding = 'UTF-8'
    controller = ActionController::Base.new
    controller.instance_variable_set(:@billed_year,  billed_on.to_s[0,4])
    controller.instance_variable_set(:@billed_month, billed_on.to_s[5,2])
    controller.instance_variable_set(:@billed_day,   billed_on.to_s[8,2])
    controller.instance_variable_set(:@billed_year,  billed_on.to_s[0,4])
    controller.instance_variable_set(:@shipper_post_code, bill.shipper_post_code)
    controller.instance_variable_set(:@shipper_name, bill.shipper_name)
    controller.instance_variable_set(:@shipper_main_address, bill.shipper_main_address)
    controller.instance_variable_set(:@from_date, from_date)
    controller.instance_variable_set(:@to_date, to_date)
    controller.instance_variable_set(:@company_post_code, manangementInfo.post_code)
    controller.instance_variable_set(:@company_name, manangementInfo.company_name)
    controller.instance_variable_set(:@address1, manangementInfo.address1)
    controller.instance_variable_set(:@tel_number, manangementInfo.tel_number)
    controller.instance_variable_set(:@fax_number, manangementInfo.fax_number)
    controller.instance_variable_set(:@bank, manangementInfo.bank)
    controller.instance_variable_set(:@bank_number, manangementInfo.bank_number)
    controller.instance_variable_set(:@register_number, manangementInfo.register_number)
    controller.instance_variable_set(:@invoice_number, manangementInfo.invoice_number)
    controller.instance_variable_set(:@last_amount, bill.last_amount)
    controller.instance_variable_set(:@handling_cost, bill.handling_cost)
    controller.instance_variable_set(:@storage_cost, bill.storage_cost)
    controller.instance_variable_set(:@sum_amount, sum_amount)
    controller.instance_variable_set(:@tax, bill.tax)
    controller.instance_variable_set(:@current_amount, bill.current_amount)

    html = controller.render_to_string(template: 'templates/bill_report', layout: nil)
    pdf = Grover.new(html).to_pdf
    send_data(pdf, filename: 'sample.pdf', type: 'application/pdf', disposition: 'inline')
  end
  def export_bill_amount_report
    bill_id   = params[:bill_id]
    from_date = params[:from_date]
    to_date   = params[:to_date]

    bill = Bill.find(bill_id)

    if bill.blank?
      render :json => {
        data: "warning"
      }, status: "error"
      return
    end

    bill_amounts = BillAmount.with_product(bill_id)
    shipper = Shipper.find(bill.shipper_id)
    manangement_info = ManagementInfo.all.first
    bill_amounts_sum = compute_shipper_bills_sum(bill_amounts)
    
    controller = ActionController::Base.new
    controller.instance_variable_set(:@from_date, from_date)
    controller.instance_variable_set(:@to_date, to_date)
    controller.instance_variable_set(:@managementInfo, manangement_info)
    controller.instance_variable_set(:@bill_amounts, bill_amounts)
    controller.instance_variable_set(:@bill_amounts_sum, bill_amounts_sum)
    controller.instance_variable_set(:@shipper, shipper)

    html = controller.render_to_string(template: 'templates/bill_amount_report', layout: nil)
    pdf = Grover.new(html).to_pdf
    send_data(pdf, filename: 'sample.pdf', type: 'application/pdf', disposition: 'inline')

    # filename = "template"
    # doc = Nokogiri::HTML(html)
    # doc.encoding = 'UTF-8'
    # pdf = Grover.new(html, format: 'A4').to_pdf
    # send_data pdf, filename: filename, type: "application/pdf"
  end
  def compute_shipper_bills_sum(bills)
    types = ['first_stock_amount', 'mid_stock_amount', 'second_stock_amount', 'total_stock', 'handle_fee', 'in_stock_amount','out_stock_amount',
            'in_stock_fee', 'out_stock_fee']

    total = Hash.new(0)
    types.each { |type| total[:"#{type}"] = 0 }

    bills.each do |record|
      total[:total_first_stock_amount]  += record.first_half_instock_amount+record.previous_stock_amount
      total[:total_mid_stock_amount]    += record.previous_stock_amount+record.first_half_instock_amount+record.mid_instock_amount+record.second_half_instock_amount-record.first_half_outstock_amount-record.mid_outstock_amount
      total[:total_second_stock_amount] += record.previous_stock_amount+record.first_half_instock_amount+record.mid_instock_amount+record.second_half_instock_amount-record.first_half_outstock_amount-record.mid_outstock_amount
      total[:total_stock]               += (record.first_half_instock_amount+record.previous_stock_amount)+(record.previous_stock_amount+record.first_half_instock_amount+record.mid_instock_amount-record.first_half_outstock_amount)+(record.previous_stock_amount+record.first_half_instock_amount+record.mid_instock_amount+record.second_half_instock_amount-record.first_half_outstock_amount-record.mid_outstock_amount)
      total[:total_handle_fee]          += record.storage_fee_rate*((record.first_half_instock_amount+record.previous_stock_amount)+(record.previous_stock_amount+record.first_half_instock_amount+record.mid_instock_amount-record.first_half_outstock_amount)+(record.previous_stock_amount+record.first_half_instock_amount+record.mid_instock_amount+record.second_half_instock_amount-record.first_half_outstock_amount-record.mid_outstock_amount))
      total[:total_in_stock_amount]     += record.first_half_instock_amount+record.second_half_instock_amount+record.mid_instock_amount
      total[:total_out_stock_amount]    += record.first_half_outstock_amount+record.second_half_outstock_amount+record.mid_outstock_amount
      total[:total_in_stock_fee]        += (record.first_half_instock_amount+record.second_half_instock_amount+record.mid_instock_amount)*record.instock_handle_fee_rate
      total[:total_out_stock_fee]       += (record.first_half_outstock_amount+record.second_half_outstock_amount+record.mid_outstock_amount)*record.outstock_handle_fee_rate
    end
    total
  end
  def export_bills_report
    bills = Bill.where("bills.duration_from='#{params[:from_date]}' and bills.duration_to='#{params[:to_date]}'")
                .joins('LEFT JOIN shippers ON shippers.id= bills.shipper_id')
                .select("bills.*, shippers.name as shipper_name, shippers.code as shipper_code")
    total_bills = compute_bills_sum(bills)

    # filename = "template"
    # doc = Nokogiri::HTML(html)
    # doc.encoding = 'UTF-8'
    # pdf = Grover.new(html, format: 'A4').to_pdf
    # send_data pdf, filename: filename, type: "application/pdf"

    controller = ActionController::Base.new
    controller.instance_variable_set(:@bills, bills)
    controller.instance_variable_set(:@total_bills, total_bills)

    html = controller.render_to_string(template: 'templates/bills_report', layout: nil)
    pdf = Grover.new(html).to_pdf
    send_data(pdf, filename: 'sample.pdf', type: 'application/pdf', disposition: 'inline')

  end
  def compute_bills_sum(bills)

    types = ['last_amount', 'deposit_amount', 'handling_cost','storage_cost', 'tax','current_amount']

    total = Hash.new(0)
    types.each { |type| total[:"#{type}"] = 0 }

    bills.each do |record|
      types.each do |type|
        total[:"#{type}"] += eval("record.#{type}")
      end
    end
    total
  end

  def export_bills_amounts_report
    from_date = params[:from_date]
    to_date   = params[:to_date]
    warehouse_id = params[:warehouse_id]
    bill = Bill.find(bill_id)

    if bill.blank?
      render :json => {
        data: "warning"
      }, status: "error"
      return
    end

    bill_amounts = BillAmount.with_product_by_duration(from_date, to_date, warehouse_id)
    shipper = Shipper.find(bill.shipper_id)
    manangement_info = ManagementInfo.all.first
    bill_amounts_sum = compute_shipper_bills_sum(bill_amounts)
    
    controller = ActionController::Base.new
    controller.instance_variable_set(:@from_date, from_date)
    controller.instance_variable_set(:@to_date, to_date)
    controller.instance_variable_set(:@managementInfo, manangement_info)
    controller.instance_variable_set(:@bill_amounts, bill_amounts)
    controller.instance_variable_set(:@bill_amounts_sum, bill_amounts_sum)
    controller.instance_variable_set(:@shipper, shipper)

    html = controller.render_to_string(template: 'templates/bill_amount_report', layout: nil)
    pdf = Grover.new(html).to_pdf
    send_data(pdf, filename: 'sample.pdf', type: 'application/pdf', disposition: 'inline')
  end
end
