module Paginatable
  extend ActiveSupport::Concern

  included do
    scope :paginate, lambda { |params = { page: nil, limit: nil }|
      page = params[:page] || 1
      limit = params[:limit] || 20
      page(page).per(limit)
    }
  end
end
