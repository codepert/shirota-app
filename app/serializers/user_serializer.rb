class UserSerializer
  include Alba::Resource
  attributes :id, :email, :name, :login_id, :user_authority_id, :responsible_category_id
  one :user_authority, serializer: UserAuthoritySerializer
  one :responsible_category, serializer: ResponsibleCategorySerializer
end
