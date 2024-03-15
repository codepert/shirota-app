class Api::V1::StocksController < Api::V1::BaseController
  def prepare_bill_amounts
    from_date =     params[:from_date]
    to_date =       params[:to_date]
    shipper_id =    params[:shipper_id]
    warehouse_id =  params[:warehouse_id]
    page =          params[:page]
    limit =         params[:limit]
    bill_date =     params[:bill_date]

    bill = Bill.where(billed_on: bill_date)

    # billsテーブルにデータがあるかどうか。
    is_bill_data = false;
    # if bill.present?
      is_bill_data = true
      # prepare_bill_amounts    = BillAmount.where(bill_id: bill.id).join(:bill).offset(page).limit(limit)
      # prepare_bill_amount_cnt = BillAmount.where(bill_id: bill.id).length
      # prepare_bill_amounts = []
      # prepare_bill_amount_cnt = 0
    # else
      prepare_bill_amounts    = Stock.prepare_bill_amounts(from_date, to_date, shipper_id, warehouse_id, page, limit)
      prepare_bill_amount_cnt = Stock.prepare_bill_amounts(from_date, to_date, shipper_id, warehouse_id).length
    # end

    last_bill = Bill.where(billed: 1).desc
    last_bill_date = ""
    if last_bill.present?
      last_bill_date = last_bill[0].billed_on
    end

    render :json => {
      data:           prepare_bill_amounts,
      count:          prepare_bill_amount_cnt,
      is_bill_data:   is_bill_data,
      last_bill_date: last_bill_date,
    }, status: :ok
  end
  def calculate_bill
    from_date     = params[:from_date]
    to_date       = params[:to_date]
    shipper_id    = params[:shipper_id]
    warehouse_id  = params[:warehouse_id]
    page          = params[:page]
    limit         = params[:limit]
    
    prepare_bill_amounts    = Stock.prepare_bill_amounts(from_date, to_date, shipper_id, warehouse_id, page, limit)
    prepare_bill_amount_cnt = Stock.prepare_bill_amounts(from_date, to_date, shipper_id, warehouse_id).length

    last_bill = Bill.where(billed: 1).desc
    last_bill_date = ""
    if last_bill.present?
      last_bill_date = last_bill[0].billed_on
    end

    render :json => {
      data:             prepare_bill_amounts,
      count:            prepare_bill_amount_cnt,
      last_bill_date:   last_bill_date,
      is_bill_data:     false
    }, status: :ok
  end
end
