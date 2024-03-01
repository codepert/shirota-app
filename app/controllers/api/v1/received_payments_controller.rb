class Api::V1::ReceivedPaymentsController < Api::V1::BaseController
  set_pagination_callback :receive_payments, [:index]

  def index
    instock_from_date = Date.strptime(params[:instockFromDate]) if params[:instockFromDate].present?
    instock_to_date = Date.strptime(params[:instockToDate]) if params[:instockToDate].present?
    process_from_date = Date.strptime("#{params[:processFromDate]} 00:00:00") if params[:processFromDate].present?
    process_to_date = Date.strptime("#{params[:processToDate]} 00:00:00") if params[:processToDate].present?
    shipper = params[:shipper].presence&.to_i
    
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
  def create_or_update_params
    params.permit(:shipper_id, :received_on, :amount, :description, :processing_on, :received)
  end
end