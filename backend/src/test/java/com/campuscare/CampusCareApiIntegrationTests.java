package com.campuscare;

import com.campuscare.entity.RequestCategory;
import com.campuscare.entity.User;
import com.campuscare.entity.UserRole;
import com.campuscare.repository.MaintenanceRequestRepository;
import com.campuscare.repository.RequestCategoryRepository;
import com.campuscare.repository.RequestStatusHistoryRepository;
import com.campuscare.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CampusCareApiIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository users;

    @Autowired
    private RequestCategoryRepository categories;

    @Autowired
    private MaintenanceRequestRepository requests;

    @Autowired
    private RequestStatusHistoryRepository history;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    @Qualifier("corsConfigurationSource")
    private CorsConfigurationSource corsConfigurationSource;

    private User student;
    private User otherStudent;
    private User admin;
    private RequestCategory plumbing;

    @BeforeEach
    void setUp() {
        history.deleteAll();
        requests.deleteAll();
        users.deleteAll();
        student = createUser("student@campus.test", "Student One", UserRole.STUDENT);
        otherStudent = createUser("other@campus.test", "Student Two", UserRole.STUDENT);
        admin = createUser("admin@campus.test", "Campus Admin", UserRole.ADMIN);
        plumbing = categories.findByName("Plumbing").orElseThrow();
    }

    @Test
    void startsApplicationSeedsCategoriesAndAllowsViteOrigins() {
        assertThat(categories.findAllByActiveTrueOrderBySortOrderAsc())
                .extracting(RequestCategory::getName)
                .containsExactly("Electrical", "Plumbing", "Furniture", "Cleanliness", "IT & Networking", "Other");

        CorsConfiguration cors = corsConfigurationSource.getCorsConfiguration(
                new MockHttpServletRequest("GET", "/api/v1/requests")
        );
        assertThat(cors).isNotNull();
        assertThat(cors.getAllowedOrigins())
                .contains("http://localhost:5173", "http://127.0.0.1:5173");
    }

    @Test
    void categoriesAndStudentRegistrationArePublicButCannotRegisterAsAdmin() throws Exception {
        mockMvc.perform(get("/api/v1/request-categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(6))
                .andExpect(jsonPath("$[0].name").value("Electrical"));

        mockMvc.perform(post("/api/v1/auth/register").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"New Student","email":"new@campus.test","password":"a-safe-password"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("STUDENT"));

        mockMvc.perform(post("/api/v1/auth/register").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Admin","email":"bad-admin@campus.test","password":"a-safe-password","role":"ADMIN"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("STUDENT"));

        assertThat(users.findByEmail("bad-admin@campus.test").orElseThrow().getRole())
                .isEqualTo(UserRole.STUDENT);
    }

    @Test
    void rejectsUnauthenticatedRequestsAndProtectsAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/v1/requests/mine"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/admin/requests"))
                .andExpect(status().isUnauthorized());

        MockHttpSession studentSession = login(student.getEmail());
        mockMvc.perform(get("/api/v1/admin/requests").session(studentSession))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/v1/dashboard/admin/summary").session(studentSession))
                .andExpect(status().isForbidden());
        mockMvc.perform(patch("/api/v1/admin/requests/CC-NONEXISTENT/status")
                        .session(studentSession).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status":"RESOLVED"}
                                """))
                .andExpect(status().isForbidden());
        mockMvc.perform(delete("/api/v1/admin/requests/CC-NONEXISTENT")
                        .session(studentSession).with(csrf()))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/v1/requests/mine").session(login(admin.getEmail())))
                .andExpect(status().isForbidden());
    }

    @Test
    void studentCanCreateListViewAndTrackOnlyOwnRequests() throws Exception {
        MockHttpSession studentSession = login(student.getEmail());
        String requestId = createRequest(studentSession, "Sink leak in washroom");

        mockMvc.perform(get("/api/v1/requests/mine").session(studentSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(1))
                .andExpect(jsonPath("$.items[0].id").value(requestId))
                .andExpect(jsonPath("$.items[0].status").value("PENDING"));
        mockMvc.perform(get("/api/v1/requests/recent").session(studentSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        mockMvc.perform(get("/api/v1/requests/{id}", requestId).session(studentSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.category").value("Plumbing"));

        mockMvc.perform(get("/api/v1/requests/{id}/history", requestId).session(studentSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].newStatus").value("PENDING"));

        MockHttpSession otherSession = login(otherStudent.getEmail());
        mockMvc.perform(get("/api/v1/requests/{id}", requestId).session(otherSession))
                .andExpect(status().isForbidden());
    }

    @Test
    void validatesRequestCreationAndReturnsFieldErrors() throws Exception {
        MockHttpSession studentSession = login(student.getEmail());
        mockMvc.perform(post("/api/v1/requests").session(studentSession).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"","categoryId":999,"location":"","description":"short","priority":"LOW"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.title").exists())
                .andExpect(jsonPath("$.validationErrors.description").exists());
    }

    @Test
    void adminCanFilterUpdateAssignSoftDeleteAndReadSummary() throws Exception {
        MockHttpSession studentSession = login(student.getEmail());
        String requestId = createRequest(studentSession, "Leaking sink in room 202");

        MockHttpSession adminSession = login(admin.getEmail());
        mockMvc.perform(get("/api/v1/admin/requests")
                        .param("query", "sink")
                        .param("status", "PENDING")
                        .param("categoryId", plumbing.getId().toString())
                        .session(adminSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(1));
        mockMvc.perform(get("/api/v1/requests/recent").session(adminSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        mockMvc.perform(patch("/api/v1/admin/requests/{id}/status", requestId)
                        .session(adminSession).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status":"IN_PROGRESS","note":"Facilities team assigned"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));

        mockMvc.perform(patch("/api/v1/admin/requests/{id}/assignment", requestId)
                        .session(adminSession).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"adminUserId":%d}
                                """.formatted(admin.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assignedAdminId").value(admin.getId()));

        mockMvc.perform(get("/api/v1/requests/{id}/history", requestId).session(studentSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[1].newStatus").value("IN_PROGRESS"));

        mockMvc.perform(get("/api/v1/dashboard/student/summary").session(studentSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.inProgress").value(1));

        mockMvc.perform(get("/api/v1/dashboard/admin/summary").session(adminSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1));

        mockMvc.perform(delete("/api/v1/admin/requests/{id}", requestId).session(adminSession).with(csrf()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/admin/requests").session(adminSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(0));
    }

    @Test
    void loginMeAndLogoutManageTheAuthenticatedSession() throws Exception {
        mockMvc.perform(get("/api/v1/auth/csrf"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.headerName").value("X-CSRF-TOKEN"))
                .andExpect(jsonPath("$.token").isNotEmpty());

        mockMvc.perform(post("/api/v1/auth/login").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"student@campus.test","password":"correct-password"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(student.getEmail()));

        MockHttpSession session = login(student.getEmail());
        mockMvc.perform(get("/api/v1/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("STUDENT"));

        mockMvc.perform(post("/api/v1/auth/logout").session(session).with(csrf()))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/auth/me").session(session))
                .andExpect(status().isUnauthorized());
    }

    private User createUser(String email, String name, UserRole role) {
        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setPasswordHash(passwordEncoder.encode("correct-password"));
        user.setRole(role);
        return users.save(user);
    }

    private MockHttpSession login(String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", email,
                                "password", "correct-password"
                        ))))
                .andExpect(status().isOk())
                .andReturn();
        return (MockHttpSession) result.getRequest().getSession(false);
    }

    private String createRequest(MockHttpSession session, String title) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/requests").session(session).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "title", title,
                                "categoryId", plumbing.getId(),
                                "location", "Hostel block C, room 202",
                                "description", "Water is leaking continuously from the sink pipe.",
                                "priority", "HIGH"
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andReturn();
        JsonNode response = objectMapper.readTree(result.getResponse().getContentAsString());
        return response.get("id").asText();
    }
}
