class UserAuthority < ApplicationRecord
  belongs_to :users
  has_many :authority_page
end
