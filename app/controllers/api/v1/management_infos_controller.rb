class Api::V1::ManagemetInfosController < Api::V1::BaseController
  before_action :authenticate_user!

  def index
    render json: ManagemetInfoSerializer.new(ManagemetInfo.all)
  end
  def create
    ManagemetInfo = ManagemetInfo.new(create_or_update_params)
    if ManagemetInfo.save
      render json: ManagemetInfoSerializer.new(ManagemetInfo), status: :created
    else
      render json: {
        error: ManagemetInfo.errors.full_messages.join("\n")
      }, status: :unprocessable_entity
    end
  end
  def update
    ManagemetInfo = ManagemetInfo.find(params[:id])
    if ManagemetInfo.update(create_or_update_params)
      render json: ManagemetInfoSerializer.new(ManagemetInfo), status: :ok
    else
       render json: {
        error: ManagemetInfo.errors.full_messages.join("\n")
      }, status: :unprocessable_entity
    end
  end
  def destroy
    ManagemetInfo = ManagemetInfo.find(params[:id])
    if ManagemetInfo.destroy
      head :no_content
    else
      render json: {
        error: ManagemetInfo.errors.full_messages.join("\n")
      }, status: :unprocessable_entity
    end
  end
  private
  def create_or_update_params
    params.permit(:company_name, :post_code, :address1, :address2, :representative, :tel_number, :fax_number, :start_data, :end_date, :processing_year, :processing_month, :istallation_location, :invoice_number, :register_number)
  end
end
