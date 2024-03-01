class Api::V1::ReceivedPaymentsController < BaseController
  def index
    # keyword = params[:keyword]
    # offset = params[:offset]
    # limit = params[:limit]
    
    # instock_from_date = params[:instockFromDate].present? ? Date.strptime(params[:instockFromDate]) : nil
    # instock_to_date = params[:instockToDate].present? ? Date.strptime(params[:instockToDate]) : nil

    # process_from_date = params[:processFromDate].present? ? Date.strptime("#{params[:processFromDate]} 00:00:00") : nil
    # process_to_date = params[:processToDate].present? ? Date.strptime("#{params[:processToDate]} 00:00:00") : nil

    # shipper = params[:shipper].presence&.to_i


    # received_payments = ReceivedPayment.includes(:shipper)
    # count = received_payments.count

    # if instock_from_date.present?
    #   received_payments = received_payments.where('received_on > ?',instock_from_date)
    # end
    # if instock_to_date.present?
    #   received_payments = received_payments.where('received_on < ?',instock_to_date)
  
    # end
    # if process_from_date.present?
    #   received_payments = received_payments.where('process_on > ?', process_from_date)
    
    # end
    # if process_to_date.present?
    #   received_payments = received_payments.where('process_on < ?',process_to_date)
    # end

    # if shipper.present?
    #   received_payments = received_payments.where('shipper_id < ?', shipper)
    # end

    # received_payments = received_payments.offset(offset).limit(limit)
   
    # render :json => {
    #   data: ReceivedPaymentSerializer.new(received_payments).as_json,
    #   count: count
    # } 
  end
  def index_params
    params.permit(:keyword, :instockFromDate, :instockToDate, :processFromDate, :processToDate, :shipper)
  end
end
