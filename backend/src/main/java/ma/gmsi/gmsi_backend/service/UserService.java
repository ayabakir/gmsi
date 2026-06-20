package ma.gmsi.gmsi_backend.service;

import ma.gmsi.gmsi_backend.dto.request.CreateUserRequest;
import ma.gmsi.gmsi_backend.dto.request.UpdateUserRequest;
import ma.gmsi.gmsi_backend.dto.response.UserResponse;

import java.util.List;
import java.util.UUID;

public interface UserService {

    UserResponse create(CreateUserRequest request);

    List<UserResponse> findAll();

    List<UserResponse> findByRole(String role);

    UserResponse findById(UUID id);

    UserResponse update(UUID id, UpdateUserRequest request);

    void activer(UUID id);

    void desactiver(UUID id);

    void delete(UUID id);
}