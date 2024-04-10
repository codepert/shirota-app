class Api::V1::ManagementInfosController < Api::V1::BaseController
  before_action :authenticate_user!

  def index
    render json: ManagementInfoSerializer.new(ManagementInfo.all)
  end
  # def create
  #   managementInfo = ManagementInfo.new(create_or_update_params)
  #   if managementInfo.save
  #     render json: ManagementInfoSerializer.new(managementInfo), status: :created
  #   else
  #     render json: {
  #       error: managementInfo.errors.full_messages.join("\n")
  #     }, status: :unprocessable_entity
  #   end
  # end
  def update
    managementInfo = ManagementInfo.find(params[:id])
    if managementInfo.update(create_or_update_params)
      render json: ManagementInfoSerializer.new(managementInfo), status: :ok
    else
       render json: {
        error: managementInfo.errors.full_messages.join("\n")
      }, status: :unprocessable_entity
    end
  end
  def destroy
    managementInfo = ManagementInfo.find(params[:id])
    if managementInfo.destroy
      head :no_content
    else
      render json: {
        error: managementInfo.errors.full_messages.join("\n")
      }, status: :unprocessable_entity
    end
  end
  private
  def create_or_update_params
    params.permit(:company_name, :post_code, :address1, :address2, :representative, :tel_number, :fax_number, :start_date, :end_date, :processing_year, :processing_month, :installation_location, :invoice_number, :register_number)
  end
end