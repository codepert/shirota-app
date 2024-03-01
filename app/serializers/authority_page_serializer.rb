class AuthorityPageSerializer
  include Alba::Resource
  attributes :user_authority_id, :page_id, :is_read, :is_edit, :page_name, :path, :parent_id
end
