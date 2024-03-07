# frozen_string_literal: true

class Api::V1::Users::SessionsController < Devise::SessionsController
  protect_from_forgery with: :exception, except: [:create]
  before_action :configure_permitted_parameters
  respond_to :json
  # before_action :configure_sign_up_params, only: [:create]
  # before_action :configure_account_update_params, only: [:update]

  # GET /resource/sign_up
  # def new
  #   super
  # end

  # POST /resource
  # def create
  #   super
  # end

  # GET /resource/edit
  # def edit
  #   super
  # end

  # PUT /resource
  # def update
  #   super
  # end

  # DELETE /resource
  # def destroy
  #   super
  # end

  # GET /resource/cancel
  # Forces the session data which is usually expired after sign
  # in to be expired now. This is useful if the user wants to
  # cancel oauth signing in/up in the middle of the process,
  # removing all OAuth session data.
  # def cancel
  #   super
  # end

  # protected

  # If you have extra params to permit, append them to the sanitizer.
  # def configure_sign_up_params
  #   devise_parameter_sanitizer.permit(:sign_up, keys: [:attribute])
  # end

  # If you have extra params to permit, append them to the sanitizer.
  # def configure_account_update_params
  #   devise_parameter_sanitizer.permit(:account_update, keys: [:attribute])
  # end

  # The path used after sign up.
  # def after_sign_up_path_for(resource)
  #   super(resource)
  # end

  # The path used after sign up for inactive accounts.
  # def after_inactive_sign_up_path_for(resource)
  #   super(resource)
  # end

  #  def create
  #   self.resource = warden.authenticate!(auth_options)
  #   set_flash_info
  #   sign_in(resource_name, resource)
  #   yield resource if block_given?
  #   respond_with(resource, serialize_options(resource))
  # end

  private

  def respond_with(current_user, _opts = {})
    permission_pages = User.joins(user_authority: { authority_page: :page })
                          .where(users: { id: resource.id })
                          .select('authority_pages.page_id, 
                                  authority_pages.is_edit, 
                                  authority_pages.is_read, 
                                  pages.path')

    if resource.persisted?
      render json: {
        status: {code: 200, message: 'Signed in successfully.'},
        data: UserSerializer.new(current_user).serialize,
        permission_pages: access_pages
      }
    else
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
