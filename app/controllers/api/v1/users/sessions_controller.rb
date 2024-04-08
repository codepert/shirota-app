# frozen_string_literal: true

class Api::V1::Users::SessionsController < Devise::SessionsController
  protect_from_forgery with: :exception, except: [:create, :destroy]
  before_action :configure_permitted_parameters
  respond_to :json
  
  private

  def respond_with(current_user, _opts = {})
    permission_pages = User.joins(user_authority: { authority_page: :page })
                          .where(users: { id: resource.id })
                          .select('authority_pages.page_id, 
                                  authority_pages.is_edit, 
                                  authority_pages.is_read, 
                                  pages.path, pages.name,
                                  pages.parent_id')

    access_origin = request.remote_ip + " " + request.user_agent

    if resource.persisted?
      UserLog.create(
        login_id:       current_user.login_id,
        access_origin:  access_origin,
        status:         'success' 
      )
      render json: {
        status: {code: 200, message: 'Signed in successfully.'},
        data: UserSerializer.new(current_user),
        permission_pages: permission_pages
      }
    else
      UserLog.create(
        login_id:       current_user.login_id,
        access_origin:  access_origin,
        status:         'fail' 
      )
      render json: {
        status: {message: "User couldn't be created successfully. #{current_user.errors.full_messages.to_sentence}"}
      }, status: :unprocessable_entity
    end
  end

  protected
  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_in, keys: %i[password login_id])
  end
end
