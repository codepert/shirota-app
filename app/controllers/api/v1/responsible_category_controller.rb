class Api::V1::ResponsibleCategoryController < ApplicationController
  before_action :authenticate_user!
  def index
    render json: ResponsibleCategorySerializer.new(ResponsibleCategory.all)
  end
end
