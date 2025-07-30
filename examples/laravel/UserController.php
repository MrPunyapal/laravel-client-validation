<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateUserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use MrPunyapal\ClientValidation\Facades\ClientValidation;

class UserController extends Controller
{
    public function create()
    {
        // Pass validation rules to the view
        $validation = ClientValidation::fromRequest(CreateUserRequest::class);

        return view('user.create', compact('validation'));
    }

    public function store(CreateUserRequest $request)
    {
        // The request is automatically validated by Laravel
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'age' => $request->age,
            'phone' => $request->phone,
            'website' => $request->website,
            'bio' => $request->bio,
        ]);

        return redirect()->route('users.index')->with('success', 'User created successfully!');
    }

    public function apiValidation()
    {
        // For API endpoints, you can return validation rules as JSON
        return response()->json([
            'validation' => ClientValidation::fromRequest(CreateUserRequest::class)
        ]);
    }
}
