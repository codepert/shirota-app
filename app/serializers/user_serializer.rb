class UserSerializer
  include Alba::Resource
  attributes :id, :email, :name, :login_id, :user_authority_id
end
