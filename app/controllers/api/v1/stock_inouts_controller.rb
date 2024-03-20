class Api::V1::StockInoutsController < Api::V1::BaseController
  before_action :authenticate_user!

  require 'csv'
  require 'grover'
  require 'nokogiri'
  def index
    shipper_id = params[:shipper_id].presence || ''
    warehouse_id = params[:warehouse_id].presence || ''
    out_date = params[:out_date].presence || ''

    result = StockInout.inventory(shipper_id, warehouse_id, out_date)

    render json: result
  end
  def check_stock_in
    lot_number =   params[:lot_number]
    warehouse_id = params[:warehouse_id]
    shipper_id =   params[:shipper_id]
    product_id=    params[:product_id]
    stock = Stock.where(
          warehouse_id:     warehouse_id,
          shipper_id:       shipper_id,
          product_id:       product_id,
        );
    
    if stock.present?
      stock_id = stock[0]['id']
      if StockInout.where(stock_id: stock_id, lot_number: lot_number).present?
        render :json => {
          status: 'exist'
        }
        return;
      end
    end
    render :json => {
      status: 'ok'
    }
  end
  def stock_in
    request_stock_in_params.each do |record|
      ActiveRecord::Base.transaction do
        stock_in_params = ActionController::Parameters.new(record).permit(
          :warehouse_id, :shipper_id, :product_id, :category, :amount, :inout_on,
          :handling_fee_rate, :storage_fee_rate, :lot_number, :weight
        )
        stock = Stock.where(
          warehouse_id:     stock_in_params[:warehouse_id],
          shipper_id:       stock_in_params[:shipper_id],
          product_id:       stock_in_params[:product_id],
        );

        if stock.present?
          adjusted_total_amount = calculate_adjusted_total_amount(stock, stock_in_params)
          stock = stock.update(
            total_amount: adjusted_total_amount
          )
          stock_id = stock[0]['id']
        else
          stock = Stock.create(
            warehouse_id:   stock_in_params[:warehouse_id],
            shipper_id:     stock_in_params[:shipper_id],
            product_id:     stock_in_params[:product_id],
            total_amount:   stock_in_params[:amount]
          )
          stock_id = stock['id']
        end
        
        StockInout.create(
          stock_id:             stock_id,
          category:             stock_in_params[:category],
          inout_on:             stock_in_params[:inout_on],
          amount:               stock_in_params[:amount],
          handling_fee_rate:    stock_in_params[:handling_fee_rate],
          storage_fee_rate:     stock_in_params[:storage_fee_rate],
          lot_number:           stock_in_params[:lot_number],
          weight:               stock_in_params[:weight],
          user_id:              current_user.id
        )
      end
    end
    
    render :json => {
      status: :accepted
    }

    rescue ActiveRecord::RecordInvalid => e
      render :json => {
        status: :unprocessable_entity,
        errors: e.record.errors.full_messages
      }
  end
  def stock_out
    request_out_params.each do |record|
      ActiveRecord::Base.transaction do

        stock_out_params = ActionController::Parameters.new(record).permit(
          :stock_id, :category, :amount, :inout_on,
          :handling_fee_rate, :storage_fee_rate, :lot_number, :weight
        )
        
        StockInout.create(
          stock_id:             stock_out_params[:stock_id],
          category:             stock_out_params[:category],
          inout_on:             stock_out_params[:inout_on],
          amount:               stock_out_params[:amount],
          handling_fee_rate:    stock_out_params[:handling_fee_rate],
          storage_fee_rate:     stock_out_params[:storage_fee_rate],
          lot_number:           stock_out_params[:lot_number],
          weight:               stock_out_params[:weight],
          user_id:              current_user.id
        )

        stock = Stock.find(stock_out_params[:stock_id]);
        existing_total_amount = stock.as_json["total_amount"]
        category = stock_out_params[:category]
    
        adjusted_total_amount = existing_total_amount.to_i - stock_out_params[:amount].to_i
  
        stock = stock.update(
          total_amount: adjusted_total_amount
        )
      end
    end
    
    render :json => {
        status: :accepted
    }

    rescue ActiveRecord::RecordInvalid => e
      render :json => {
        status: :unprocessable_entity,
        errors: e.record.errors.full_messages
      }
  end
  def uncalc_bills
    from_date     = params[:from_date]
    to_date       = params[:to_date]
    shipper_id    = params[:shipper_id]
    warehouse_id  = params[:warehouse_id]
    page          = params[:page]
    limit         = params[:limit]
    
    prepare_bill_amounts    = Stock.get_uncalc_bills(from_date, to_date, nil, warehouse_id, page, limit)
    prepare_bill_amount_cnt = Stock.get_uncalc_bills(from_date, to_date, nil, warehouse_id).length

    render :json => {
      data:             prepare_bill_amounts,
      count:            prepare_bill_amount_cnt,
    }, status: :ok
  end
  def stock_in_csv_export
    data = params.require(:data)
    csv_data = CSV.generate do |csv|
      csv << ["品名", "荷姿", "ロット番号", "重量", "数量"]
      data.each do |record|
        csv << [record.dig(:product_name), record.dig(:product_type), record.dig(:lot_number), record.dig(:weight), record.dig(:amount)]
      end
    end
    
    send_data csv_data, filename: "stock.csv", type: "text/csv", disposition: "inline"
  end

  private
  def calculate_adjusted_total_amount(stock, stock_inout_params)
    existing_total_amount = stock[0].total_amount
    category              = stock_inout_params[:category]
    new_total_amount      = category == 0 ? (existing_total_amount.to_i + stock_inout_params[:amount].to_i) : (existing_total_amount.to_i - stock_inout_params[:amount].to_i)
    new_total_amount
  end
  def request_stock_in_params
    params.require(:stock_inout).map do |uparams|
      {
        warehouse_id:         uparams["warehouse_id"], 
        shipper_id:           uparams["shipper_id"], 
        product_id:           uparams["product_id"], 
        category:             uparams["category"], 
        amount:               uparams["amount"], 
        inout_on:             uparams["inout_on"],
        handling_fee_rate:    uparams["handling_fee_rate"],
        storage_fee_rate:     uparams["storage_fee_rate"],
        lot_number:           uparams["lot_number"],
        weight:               uparams["weight"],
        # stock_id:             uparams["stock_id"]
      }
    end
  end
  def request_out_params
    params.require(:data).map do |uparams|
      {
        category:             uparams["category"], 
        amount:               uparams["amount"], 
        inout_on:             uparams["inout_on"],
        handling_fee_rate:    uparams["handling_fee_rate"],
        storage_fee_rate:     uparams["storage_fee_rate"],
        lot_number:           uparams["lot_number"],
        weight:               uparams["weight"],
        stock_id:             uparams["stock_id"]
      }
    end
  end
end
