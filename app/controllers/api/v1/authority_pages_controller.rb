class Api::V1::AuthorityPagesController < Api::V1::BaseController
  def index
    render json: AuthorityPageSerializer.new(AuthorityPage.reference_user_page)
  end

  def create_or_update
    ActiveRecord::Base.transaction do
      # params[:_json].each do |params|
      create_or_update_params.each do |params|
        authority_page = AuthorityClientPage.find_or_initialize_by(
          user_authority_id: params[:user_authority_id],
          page_id: params[:page_id]
        )
        authority_page.is_edit = params[:is_edit]
        authority_page.is_read = params[:is_read]
        authority_page.save!
      end
    end

    render json: { message: 'success' }, status: :ok
    
    rescue StandardError => e
      render json: { error: e.message }, status: :unprocessable_entity
    
    # rescue ActiveRecord::RecordInvalid => e
    #   render :json => {
    #     status: :unprocessable_entity,
    #     errors: e.record.errors.full_messages
    #   }
  end
  def create_or_update_params
    params.require(:authority_pages).map do |authority_pages|
      create_or_update_params.permit(:user_authority_id, :page_id, :is_edit, :is_read)
    end
  end
end
