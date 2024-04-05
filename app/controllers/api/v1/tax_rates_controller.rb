class Api::V1::TaxRatesController < ApplicationController
    before_action :authenticate_user!

  def index
    render json: TaxRateSerializer.new(TaxRate.all)
  end
  def create
    taxRate = TaxRate.new(create_or_update_params)
    if taxRate.save
      render json: TaxRateSerializer.new(taxRate), status: :created
    else
      render json: {
        error: taxRate.errors.full_messages.join("\n")
      }, status: :unprocessable_entity
    end
  end
  def update
    taxRate = TaxRate.find(params[:id])
    if taxRate.update(create_or_update_params)
      render json: TaxRateSerializer.new(taxRate), status: :ok
    else
       render json: {
        error: taxRate.errors.full_messages.join("\n")
      }, status: :unprocessable_entity
    end

  end
  def destroy
    taxRate = TaxRate.find(params[:id])
    if taxRate.destroy
      head :no_content
    else
      render json: {
        error: taxRate.errors.full_messages.join("\n")
      }, status: :unprocessable_entity
    end

  end
  def create_or_update_params
    params.permit(:ab_date, :tax_type, :tax_rate)
  end
end
