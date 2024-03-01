class AuthorityPage < ApplicationRecord
  belongs_to :user_authority
  belongs_to :page

  scope :reference_user_page, -> {
    joins(:page)
    .select("user_authority_id, page_id, is_edit, is_read, pages.name as page_name, pages.path, pages.parent_id")
  }
end