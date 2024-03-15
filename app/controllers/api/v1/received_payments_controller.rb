class Api::V1::ReceivedPaymentsController < Api::V1::BaseController
  set_pagination_callback :receive_payments, [:index]

  def index
    instock_from_date = Date.strptime(params[:instockFromDate]) if params[:instockFromDate].present?
    instock_to_date   = Date.strptime(params[:instockToDate]) if params[:instockToDate].present?
    process_from_date = Date.strptime("#{params[:processFromDate]} 00:00:00") if params[:processFromDate].present?
    process_to_date   = Date.strptime("#{params[:processToDate]} 00:00:00") if params[:processToDate].present?
    shipper           = params[:shipper].presence&.to_i
    
    search = ReceivedPayment.ransack(
      received_on_gteq:     instock_from_date,
      received_on_lteq:     instock_to_date,
      process_on_gteq:      process_from_date,
      process_on_lteq:      process_to_date,
      shipper_id:           shipper
    )
   
    @receive_payments = search.result.paginate(pagination_params)

    render json: ReceivedPaymentSerializer.new(@receive_payments)

  end

  def create
    receivedPayment = ReceivedPayment.new(create_or_update_params)
    if receivedPayment.save
      render json: ReceivedPaymentSerializer.new(receivedPayment), status: :created
    else
      render json: {
        error: receivedPayment.errors.full_messages.join("\n")
      }, status: :unprocessable_entity
    end
  end

  def update
    receivedPayment = ReceivedPayment.find(params[:id])
    if receivedPayment.update(create_or_update_params)
      render json: ReceivedPaymentSerializer.new(receivedPayment), status: :ok
    else
       render json: {
        error: receivedPayment.errors.full_messages.join("\n")
      }, status: :unprocessable_entity
    end
  end

  def destroy
    receivedPayment = ReceivedPayment.find(params[:id])
    if receivedPayment.destroy
      head :no_content
    else
      render json: {
        error: receivedPayment.errors.full_messages.join("\n")
      }, status: :unprocessable_entity
    end
  end
  def csv_export
    keyword = params[:keyword]
    offset = params[:offset]
    limit = params[:limit]
    
    instock_from_date = params[:instockFromDate].present? ? Date.strptime(params[:instockFromDate]) : nil
    instock_to_date   = params[:instockToDate].present? ? Date.strptime(params[:instockToDate]) : nil

    process_from_date = params[:processFromDate].present? ? Date.strptime("#{params[:processFromDate]} 00:00:00") : nil
    process_to_date   = params[:processToDate].present? ? Date.strptime("#{params[:processToDate]} 00:00:00") : nil

    shipper = params[:shipper].presence&.to_i


    received_payments = ReceivedPayment.with_shipper()
    count = received_payments.count

    if instock_from_date.present?
      received_payments = received_payments.where('received_on > ?',instock_from_date)
    end
    if instock_to_date.present?
      received_payments = received_payments.where('received_on < ?',instock_to_date)
  
    end
    if process_from_date.present?
      received_payments = received_payments.where('process_on > ?', process_from_date)
    
    end
    if process_to_date.present?
      received_payments = received_payments.where('process_on < ?',process_to_date)
    end

    if shipper.present?
      received_payments = received_payments.where('shipper_id ', shipper)
    end

    # received_payments = received_payments.offset(offset).limit(limit)
    received_payments= ReceivedPaymentSerializer.new(received_payments).as_json
    csv_data = CSV.generate do |csv|
      csv << ["入金日", "荷主コード", "荷主名", "入金額", "摘要", "処理日時"]
      received_payments.each do |record|
        csv << [(record['received_on']).strftime("%Y/%m/%d"), record['shipper']['name'], record['shipper']['code'], record['amount'], record['description'] , record['processing_on'].presence.try(:strftime, "%Y/%m/%d")]
      end
    end

    send_data csv_data, filename: "receivepayment.csv", type: "text/csv", disposition: "inline"
  end
  def create_or_update_params
    params.permit(:shipper_id, :received_on, :amount, :description, :processing_on, :received)
  end
end