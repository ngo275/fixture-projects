<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BookController extends Controller
{
    private $books = [
        ['id' => 1, 'title' => 'The Great Gatsby', 'author' => 'F. Scott Fitzgerald', 'year' => 1925],
        ['id' => 2, 'title' => '1984', 'author' => 'George Orwell', 'year' => 1949],
        ['id' => 3, 'title' => 'To Kill a Mockingbird', 'author' => 'Harper Lee', 'year' => 1960],
    ];

    public function index(): JsonResponse
    {
        return response()->json($this->books);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'year' => 'required|integer|min:1000|max:' . date('Y'),
        ]);

        $newBook = array_merge(['id' => count($this->books) + 1], $validated);
        return response()->json($newBook, 201);
    }

    public function show(string $id): JsonResponse
    {
        $book = collect($this->books)->firstWhere('id', $id);
        
        if (!$book) {
            return response()->json(['message' => 'Book not found'], 404);
        }

        return response()->json($book);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'author' => 'sometimes|required|string|max:255',
            'year' => 'sometimes|required|integer|min:1000|max:' . date('Y'),
        ]);

        $bookIndex = collect($this->books)->search(function ($book) use ($id) {
            return $book['id'] == $id;
        });

        if ($bookIndex === false) {
            return response()->json(['message' => 'Book not found'], 404);
        }

        $this->books[$bookIndex] = array_merge($this->books[$bookIndex], $validated);
        return response()->json($this->books[$bookIndex]);
    }

    public function destroy(string $id): JsonResponse
    {
        $bookIndex = collect($this->books)->search(function ($book) use ($id) {
            return $book['id'] == $id;
        });

        if ($bookIndex === false) {
            return response()->json(['message' => 'Book not found'], 404);
        }

        unset($this->books[$bookIndex]);
        return response()->json(['message' => 'Book deleted']);
    }
}