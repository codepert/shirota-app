class Api::V1::StocksController < Api::V1::BaseController
  before_action :authenticate_user!
  
  def uncalc_bills
    from_date     = params[:from_date]
    to_date       = params[:to_date]
    shipper_id    = params[:shipper_id]
    warehouse_id  = params[:warehouse_id]
    page          = params[:page]
    limit         = params[:limit]
    
    prepare_bill_amounts    = Stock.get_uncalc_bills(from_date, to_date, shipper_id, warehouse_id, page, limit)
    prepare_bill_amount_cnt = Stock.get_uncalc_bills(from_date, to_date, shipper_id, warehouse_id, page, limit).length

    last_bill = Bill.where(billed: 1).desc
    last_bill_date = ""
    if last_bill.present?
      last_bill_date = last_bill[0].billed_on
    end

    render :json => {
      data:             prepare_bill_amounts,
      count:            prepare_bill_amount_cnt,
      last_bill_date:   last_bill_date,
    }, status: :ok
  end
end
