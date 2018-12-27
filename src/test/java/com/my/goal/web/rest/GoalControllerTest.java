package com.my.goal.web.rest;

import com.my.goal.MyGoalApp;
import com.my.goal.domain.Event;
import com.my.goal.domain.Status;
import com.my.goal.domain.User;
import com.my.goal.repository.EventRepository;
import com.my.goal.repository.UserRepository;
import org.apache.commons.lang3.RandomStringUtils;
import org.assertj.core.internal.bytebuddy.utility.RandomString;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.util.Optional;

import static java.lang.Thread.sleep;
import static junit.framework.Assert.assertTrue;
import static junit.framework.TestCase.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = MyGoalApp.class)
public class GoalControllerTest {
    @Autowired
    private EventRepository eventRepository;
    @Autowired
    private GoalController goalController;
    @Autowired
    private EventController eventController;
    @Autowired
    private UserRepository userRepository;

    private MockMvc restAuditMockMvc;
    private static final String SAMPLE_USER = "test-user";

    @Before
    public void setUp() throws Exception {
        MockitoAnnotations.initMocks(this);
        userRepository.deleteAll();
        this.restAuditMockMvc = MockMvcBuilders.standaloneSetup(goalController, eventController).build();

        User user = new User();
        user.setLogin(SAMPLE_USER);
        user.setEmail("test-user@wp.pl");
        user.setPassword(RandomStringUtils.random(60));
        user.setActivated(true);
        userRepository.save(user);
    }

    @After
    public void tearDown() throws Exception {
        userRepository.deleteAll();
        eventRepository.deleteAll();
    }

    @Test
    @WithMockUser(SAMPLE_USER)
    public void stop() throws Exception {
        String name = "test" + RandomString.make(40);
        Instant end = Instant.now();
        Event event = new Event();
        event.setEndDate(end);
        event.setName(name);

        restAuditMockMvc.perform(post("/api/goal/events")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(event)))
            .andExpect(status().isOk());
        restAuditMockMvc.perform(get("/api/goal/start/" + name))
            .andExpect(status().isOk());
        sleep(1000);
        restAuditMockMvc.perform(get("/api/goal/stop/"))
            .andExpect(status().isOk());

        Optional<Event> foundEvent = eventRepository.findByName(name);
        assertTrue(foundEvent.isPresent());
        assertEquals(1, foundEvent.get().getSessions().size());
        assertTrue(foundEvent.get().getSessions().iterator().next().getDuration() >= 1);
        assertEquals(end, foundEvent.get().getEndDate());
        assertEquals(Status.CLOSE, foundEvent.get().getSessions().iterator().next().getStatus());
    }

    @Test
    @WithMockUser(SAMPLE_USER)
    public void start() throws Exception {
        String name = "test" + RandomString.make(40);
        Instant end = Instant.now();
        Event event = new Event();
        event.setEndDate(end);
        event.setName(name);

        restAuditMockMvc.perform(post("/api/goal/events")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(event)))
            .andExpect(status().isOk());
        restAuditMockMvc.perform(get("/api/goal/start/" + name))
            .andExpect(status().isOk());

        sleep(1000);
        Optional<Event> foundEvent = eventRepository.findByName(name);
        assertTrue(foundEvent.isPresent());
        assertEquals(1, foundEvent.get().getSessions().size());
        assertTrue(foundEvent.get().getSessions().iterator().next().getDuration() >= 1);
        assertEquals(end, foundEvent.get().getEndDate());
        assertEquals(Status.INP, foundEvent.get().getSessions().iterator().next().getStatus());
    }
}
