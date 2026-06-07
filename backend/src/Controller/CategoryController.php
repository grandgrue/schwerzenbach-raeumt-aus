<?php

declare(strict_types=1);

namespace App\Controller;

use App\Http\Request;
use App\Http\Response;
use App\Repository\CategoryRepository;

final class CategoryController
{
    public function __construct(
        private readonly CategoryRepository $categories = new CategoryRepository(),
    ) {
    }

    /** GET /categories */
    public function index(Request $request, array $params): void
    {
        Response::json($this->categories->all());
    }
}
