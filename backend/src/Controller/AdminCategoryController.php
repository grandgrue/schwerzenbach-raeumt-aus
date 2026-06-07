<?php

declare(strict_types=1);

namespace App\Controller;

use App\Auth\AdminAuth;
use App\Http\HttpException;
use App\Http\Request;
use App\Http\Response;
use App\Repository\CategoryRepository;

/**
 * Admin-Verwaltung der Kategorien (anlegen, umbenennen, löschen).
 * Löschen ist nur möglich, wenn keine Stände die Kategorie nutzen.
 */
final class AdminCategoryController
{
    public function __construct(
        private readonly AdminAuth $auth = new AdminAuth(),
        private readonly CategoryRepository $categories = new CategoryRepository(),
    ) {
    }

    /** GET /admin/categories */
    public function index(Request $request, array $params): void
    {
        $this->auth->requireAuth();
        Response::json($this->categories->allWithCounts());
    }

    /** POST /admin/categories */
    public function store(Request $request, array $params): void
    {
        $this->auth->requireAuth();
        $this->auth->requireCsrf($request);

        $name = $this->validateName($request);
        if ($this->categories->nameExists($name)) {
            throw HttpException::badRequest('Diese Kategorie existiert bereits', ['name' => 'bereits vergeben']);
        }
        $id = $this->categories->create($name, $this->sortOrder($request));
        Response::json(['id' => $id, 'name' => $name], 201);
    }

    /** PATCH /admin/categories/{id} */
    public function update(Request $request, array $params): void
    {
        $this->auth->requireAuth();
        $this->auth->requireCsrf($request);

        $id = (int) ($params['id'] ?? 0);
        if ($this->categories->findById($id) === null) {
            throw HttpException::notFound('Kategorie nicht gefunden');
        }
        $name = $this->validateName($request);
        if ($this->categories->nameExists($name, $id)) {
            throw HttpException::badRequest('Diese Kategorie existiert bereits', ['name' => 'bereits vergeben']);
        }
        $this->categories->update($id, $name, $this->sortOrder($request));
        Response::json(['ok' => true]);
    }

    /** DELETE /admin/categories/{id} */
    public function destroy(Request $request, array $params): void
    {
        $this->auth->requireAuth();
        $this->auth->requireCsrf($request);

        $id = (int) ($params['id'] ?? 0);
        if ($this->categories->findById($id) === null) {
            throw HttpException::notFound('Kategorie nicht gefunden');
        }
        $count = $this->categories->countStands($id);
        if ($count > 0) {
            throw new HttpException(
                409,
                'category_in_use',
                "Diese Kategorie wird von {$count} Stand/Ständen genutzt und kann nicht gelöscht werden.",
            );
        }
        $this->categories->delete($id);
        Response::noContent();
    }

    private function validateName(Request $request): string
    {
        $name = trim((string) $request->input('name', ''));
        if ($name === '') {
            throw HttpException::badRequest('Bitte einen Namen angeben', ['name' => 'Pflichtfeld']);
        }
        if (mb_strlen($name) > 80) {
            throw HttpException::badRequest('Name zu lang', ['name' => 'Höchstens 80 Zeichen']);
        }
        return $name;
    }

    private function sortOrder(Request $request): ?int
    {
        $value = $request->input('sort_order');
        return is_numeric($value) ? (int) $value : null;
    }
}
