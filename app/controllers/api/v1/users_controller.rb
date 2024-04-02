class Api::V1::UsersController < Api::V1::BaseController
  before_action :authenticate_user!

  def index
    # render json: User.with_authority_info.to_json
    render json: UserSerializer.new(User.all)
  end
  def create
    user = User.new(register_params);
    if user.save
      render json: UserSerializer.new(user), status: :created
    else
      render json: {
        message: user.errors.full_messages.join("\n")
      }, status: :unprocessable_entity
    end
  end
  def update
    user= User.find(params[:id])
    if user.update(register_params)
      render json: UserSerializer.new(user).to_json, status: :ok
    else      
      render json: {
        error: user.errors.full_messages.join("\n")
      }, status: :unprocessable_entity
    end
  end
  def inititialize_password
    user = User.find(params[:id])
    if user.update(password: 'Empl0yee!')
      render json: UserSerializer.new(user).to_json, status: :ok
    else      
      render json: {
        error: user.errors.full_messages.join("\n")
      }, status: :unprocessable_entity
    end
  end
  def register_params
    params.permit(:name, :password, :login_id, :user_authority_id, :email, :responsible_category_id)
  end
end
