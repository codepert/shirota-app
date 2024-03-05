# frozen_string_literal: true

class Api::V1::Users::SessionsController < Devise::SessionsController
  protect_from_forgery with: :exception, except: [:create, :destroy]
  respond_to :json
  before_action :configure_sign_in_params, only: [:create]

  # If you have extra params to permit, append them to the sanitizer.
  def configure_sign_in_params
    devise_parameter_sanitizer.permit(:sign_in, keys: [:login_id])
  end
  private
  def respond_with(current_user, _opts = {})
  #  authority_client_pages = User.joins(user_authority: { authority_client_pages: :client_page })
  #                         .where(users: { id: resource.id })
  #                         .select('authority_client_pages.client_page_id, 
  #                                   authority_client_pages.is_edit, 
  #                                   authority_client_pages.is_read, 
  #                                   client_pages.path')
    puts UserSerializer.new(current_user)
    pemisstion_pages = User.user_page_permission(current_user.id)
    render json: {
      status: {code: 200, message: 'Logged in sucessfully.'},
      data: UserSerializer.new(current_user),
      authority_client_pages: pemisstion_pages
    }, status: :ok
  end
  def respond_to_on_destroy
    if request.headers['Authorization'].present?
      jwt_payload = JWT.decode(request.headers['Authorization'].split(' ').last, Rails.application.credentials.fetch(:secret_key_base)).first
      current_user = User.find(jwt_payload['sub'])
    end
    
    if current_user
      render json: {
        status: 200,
        message: 'Logged out successfully.'
      }, status: :ok
    else
      render json: {
        status: 401,
        message: "Couldn't find an active session."
      }, status: :unauthorized
    end
  end
  protected

  def find_for_database_authentication(warden_conditions)
    conditions = warden_conditions.dup
    login_id = conditions.delete(:login_id)
    where(conditions.to_h).where(["lower(login_id) = :value", { value: login_id.downcase }]).first
  end
end
