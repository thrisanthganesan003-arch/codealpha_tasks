let currentPostId = null;

async function loadUserData() {
    if (!currentUser) return;
    
    // Update user info in sidebar
    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('user-username').textContent = `@${currentUser.username}`;
    document.getElementById('user-bio').textContent = currentUser.bio || 'No bio yet';
    document.getElementById('user-avatar').src = currentUser.avatar || 'https://via.placeholder.com/100';
    
    // Load user stats
    try {
        const response = await fetch(`${API_URL}/users/${currentUser.username}`, {
            headers: {
                'x-auth-token': token
            }
        });
        
        if (response.ok) {
            const userData = await response.json();
            document.getElementById('following-count').textContent = userData.following_count || 0;
            document.getElementById('followers-count').textContent = userData.followers_count || 0;
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

async function createPost() {
    const content = document.getElementById('post-content').value;
    
    if (!content.trim()) {
        alert('Please enter some content');
        return;
    }
    
    if (!token) {
        alert('Please login to create a post');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ content })
        });
        
        console.log('Create post response status:', response.status);
        
        if (response.ok) {
            document.getElementById('post-content').value = '';
            loadPosts();
            console.log('Post created successfully');
        } else {
            const error = await response.json();
            console.error('Error creating post:', response.status, error);
            alert('Error creating post: ' + (error.error || error.message));
        }
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Error creating post: ' + error.message);
    }
}

async function loadPosts() {
    try {
        const response = await fetch(`${API_URL}/posts`);
        
        console.log('Posts response status:', response.status);
        
        if (response.ok) {
            const posts = await response.json();
            console.log('Posts loaded:', posts);
            displayPosts(posts);
        } else {
            const error = await response.json();
            console.error('Error loading posts:', response.status, error);
        }
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

function displayPosts(posts) {
    const container = document.getElementById('posts-feed');
    container.innerHTML = '';
    
    posts.forEach(post => {
        const postElement = createPostElement(post);
        container.appendChild(postElement);
    });
}

function createPostElement(post) {
    const div = document.createElement('div');
    div.className = 'post';
    const isOwnPost = currentUser && currentUser.id === post.user_id;
    
    div.innerHTML = `
        <div class="post-header">
            <img src="${post.avatar || 'https://via.placeholder.com/50'}" alt="${post.name}" class="post-avatar">
            <div class="post-user-info">
                <h4>${post.name}</h4>
                <p class="post-username">@${post.username}</p>
                <p class="post-time">${formatDate(post.created_at)}</p>
            </div>
            ${isOwnPost ? `
                <div class="post-menu">
                    <button class="menu-btn" onclick="deletePost(${post.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            ` : ''}
        </div>
        <div class="post-content">${post.content}</div>
        ${post.image ? `<img src="${post.image}" alt="Post image" class="post-image">` : ''}
        <div class="post-stats">
            <span>${post.likes_count || 0} Likes</span>
            <span>${post.comments_count || 0} Comments</span>
        </div>
        <div class="post-actions">
            <button class="action-btn ${post.liked ? 'liked' : ''}" onclick="likePost(${post.id})">
                <i class="fas fa-heart"></i> Like
            </button>
            <button class="action-btn" onclick="viewPost(${post.id})">
                <i class="fas fa-comment"></i> Comment
            </button>
            <button class="action-btn" onclick="viewProfile('${post.username}')">
                <i class="fas fa-user"></i> Profile
            </button>
        </div>
    `;
    return div;
}

async function likePost(postId) {
    try {
        const headers = {};
        if (token) headers['x-auth-token'] = token;

        const response = await fetch(`${API_URL}/posts/${postId}/like`, {
            method: 'POST',
            headers
        });

        if (response.status === 401 || response.status === 403) {
            const js = await response.json().catch(() => ({}));
            return alert('Could not like post: ' + (js.error || response.statusText));
        }

        if (response.ok) loadPosts();
    } catch (error) {
        console.error('Error liking post:', error);
    }
}

async function viewPost(postId) {
    currentPostId = postId;
    
    try {
        // Load post details
        const postResponse = await fetch(`${API_URL}/posts`, {
            headers: {
                'x-auth-token': token
            }
        });
        
        if (postResponse.ok) {
            const posts = await postResponse.json();
            const post = posts.find(p => p.id === postId);
            
            if (post) {
                const postDetail = document.getElementById('post-detail');
                postDetail.innerHTML = `
                    <div class="post-header">
                        <img src="${post.avatar || 'https://via.placeholder.com/50'}" alt="${post.name}" class="post-avatar">
                        <div class="post-user-info">
                            <h4>${post.name}</h4>
                            <p class="post-username">@${post.username}</p>
                            <p class="post-time">${formatDate(post.created_at)}</p>
                        </div>
                    </div>
                    <div class="post-content">${post.content}</div>
                    ${post.image ? `<img src="${post.image}" alt="Post image" class="post-image">` : ''}
                    <div class="post-stats">
                        <span>${post.likes_count || 0} Likes</span>
                        <span>${post.comments_count || 0} Comments</span>
                    </div>
                `;
                
                // Load comments
                await loadComments(postId);
                
                // Show modal
                document.getElementById('post-modal').classList.remove('hidden');
            }
        }
    } catch (error) {
        console.error('Error viewing post:', error);
    }
}

async function loadComments(postId) {
    try {
        const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
            headers: {
                'x-auth-token': token
            }
        });
        
        if (response.ok) {
            const comments = await response.json();
            displayComments(comments);
        }
    } catch (error) {
        console.error('Error loading comments:', error);
    }
}

function displayComments(comments) {
    const container = document.getElementById('comments-container');
    container.innerHTML = '';
    
    comments.forEach(comment => {
        const commentElement = createCommentElement(comment);
        container.appendChild(commentElement);
    });
}

function createCommentElement(comment) {
    const div = document.createElement('div');
    div.className = 'comment';
    const isOwnComment = currentUser && currentUser.id === comment.user_id;
    
    div.innerHTML = `
        <img src="${comment.avatar || 'https://via.placeholder.com/40'}" alt="${comment.name}" class="comment-avatar">
        <div class="comment-content">
            <div class="comment-header">
                <span class="comment-user">${comment.name}</span>
                <span class="comment-time">${formatDate(comment.created_at)}</span>
                ${isOwnComment ? `<button class="delete-comment-btn" onclick="deleteComment(${currentPostId}, ${comment.id})"><i class="fas fa-trash"></i></button>` : ''}
            </div>
            <p>${comment.content}</p>
        </div>
    `;
    return div;
}

async function addComment() {
    const content = document.getElementById('comment-content').value;
    
    if (!content.trim() || !currentPostId) return;
    
    try {
        const response = await fetch(`${API_URL}/posts/${currentPostId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ content })
        });
        
        if (response.ok) {
            document.getElementById('comment-content').value = '';
            await loadComments(currentPostId);
        }
    } catch (error) {
        console.error('Error adding comment:', error);
    }
}

function closePostModal() {
    document.getElementById('post-modal').classList.add('hidden');
    currentPostId = null;
}

async function viewProfile(username) {
    try {
        const response = await fetch(`${API_URL}/users/${username}`, {
            headers: {
                'x-auth-token': token
            }
        });
        
        if (response.ok) {
            const userData = await response.json();
            showProfileModal(userData, username);
        }
    } catch (error) {
        console.error('Error viewing profile:', error);
        alert('Error loading profile');
    }
}

function showProfileModal(userData, username) {
    const profileModal = document.getElementById('profile-modal');
    const profileBody = document.getElementById('profile-modal-body');
    
    const isCurrentUser = currentUser.username === username;
    const followBtnHTML = !isCurrentUser ? 
        `<button class="follow-btn ${userData.is_following ? 'following' : ''}" onclick="toggleFollow(${userData.id}, '${username}')">
            ${userData.is_following ? 'Unfollow' : 'Follow'}
        </button>
        <button class="follow-request-btn" onclick="sendFollowRequest(${userData.id})" style="background: #667eea; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; margin-left: 10px;">
            <i class="fas fa-user-plus"></i> Follow Request
        </button>` : '';
    
    profileBody.innerHTML = `
        <button class="profile-modal-close" onclick="closeProfileModal()">×</button>
        <div class="profile-header">
            <img src="${userData.avatar || 'https://via.placeholder.com/120'}" alt="${userData.name}" class="profile-avatar">
            <div class="profile-info">
                <h2>${userData.name}</h2>
                <p class="profile-username">@${userData.username}</p>
                <p class="profile-bio">${userData.bio || 'No bio yet'}</p>
                <div class="profile-stats">
                    <div class="stat">
                        <span class="stat-count">${userData.followers_count || 0}</span>
                        <span class="stat-label">Followers</span>
                    </div>
                    <div class="stat">
                        <span class="stat-count">${userData.following_count || 0}</span>
                        <span class="stat-label">Following</span>
                    </div>
                </div>
                ${followBtnHTML}
            </div>
        </div>
        <div id="profile-posts-container" class="profile-posts"></div>
    `;
    
    document.getElementById('profile-modal').classList.add('show');
    
    // Load user's posts
    loadProfilePosts(userData.id);
}

async function loadProfilePosts(userId) {
    try {
        const response = await fetch(`${API_URL}/users/${userId}/posts`, {
            headers: {
                'x-auth-token': token
            }
        });
        
        if (response.ok) {
            const posts = await response.json();
            const container = document.getElementById('profile-posts-container');
            container.innerHTML = '<h3>Posts</h3>';
            
            if (posts.length === 0) {
                container.innerHTML += '<p>No posts yet</p>';
            } else {
                posts.forEach(post => {
                    const postEl = createPostElement(post);
                    container.appendChild(postEl);
                });
            }
        }
    } catch (error) {
        console.error('Error loading profile posts:', error);
    }
}

async function toggleFollow(userId, username) {
    try {
        const response = await fetch(`${API_URL}/users/${userId}/follow`, {
            method: 'POST',
            headers: {
                'x-auth-token': token
            }
        });
        
        if (response.ok) {
            const btn = event.target;
            const data = await response.json();
            
            if (data.following) {
                btn.textContent = 'Unfollow';
                btn.classList.add('following');
            } else {
                btn.textContent = 'Follow';
                btn.classList.remove('following');
            }
            
            // Reload user data to update counts
            loadUserData();
        }
    } catch (error) {
        console.error('Error toggling follow:', error);
        alert('Error updating follow status');
    }
}

async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
        const response = await fetch(`${API_URL}/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'x-auth-token': token
            }
        });
        
        if (response.ok) {
            loadPosts();
        } else {
            alert('Error deleting post');
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('Error deleting post');
    }
}

async function deleteComment(postId, commentId) {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    try {
        const response = await fetch(`${API_URL}/posts/${postId}/comments/${commentId}`, {
            method: 'DELETE',
            headers: {
                'x-auth-token': token
            }
        });
        
        if (response.ok) {
            await loadComments(postId);
        } else {
            alert('Error deleting comment');
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Error deleting comment');
    }
}

function showFeed() {
    loadPosts();
}

function showProfile() {
    if (currentUser) {
        showProfileModal(currentUser, currentUser.username);
        loadProfilePosts(currentUser.id);
    }
}

function closeProfileModal() {
    document.getElementById('profile-modal').classList.remove('show');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
}

// Initialize the app
if (token) {
    loadUserData();
    loadPosts();
}

// Follow request functions
async function sendFollowRequest(userId) {
    try {
        const response = await fetch(`${API_URL}/users/${userId}/follow-request`, {
            method: 'POST',
            headers: {
                'x-auth-token': token
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            alert('Follow request sent!');
        } else {
            const error = await response.json();
            alert(error.error || 'Error sending follow request');
        }
    } catch (error) {
        console.error('Error sending follow request:', error);
        alert('Error sending follow request');
    }
}

async function loadFollowRequests() {
    try {
        const response = await fetch(`${API_URL}/users/requests/pending`, {
            headers: {
                'x-auth-token': token
            }
        });
        
        if (response.ok) {
            const requests = await response.json();
            displayFollowRequests(requests);
        }
    } catch (error) {
        console.error('Error loading follow requests:', error);
    }
}

function displayFollowRequests(requests) {
    const container = document.getElementById('follow-requests-container');
    if (!container) return;
    
    if (requests.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">No pending follow requests</p>';
        return;
    }
    
    container.innerHTML = '<h3>Follow Requests</h3>';
    requests.forEach(request => {
        const requestEl = document.createElement('div');
        requestEl.className = 'follow-request-item';
        requestEl.style.cssText = 'display: flex; align-items: center; gap: 15px; padding: 15px; background: #f9f9f9; border-radius: 8px; margin-bottom: 10px;';
        
        requestEl.innerHTML = `
            <img src="${request.avatar || 'https://via.placeholder.com/50'}" alt="${request.name}" style="width: 50px; height: 50px; border-radius: 50%; border: 2px solid #667eea;">
            <div style="flex: 1;">
                <h4 style="margin: 0; color: #333;">${request.name}</h4>
                <p style="margin: 0; color: #667eea; font-size: 0.9em;">@${request.username}</p>
            </div>
            <button onclick="acceptFollowRequest(${request.id})" style="padding: 8px 16px; background: #00b894; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; margin-right: 10px;">
                <i class="fas fa-check"></i> Accept
            </button>
            <button onclick="rejectFollowRequest(${request.id})" style="padding: 8px 16px; background: var(--button); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                <i class="fas fa-times"></i> Reject
            </button>
        `;
        
        container.appendChild(requestEl);
    });
}

async function acceptFollowRequest(requestId) {
    try {
        const response = await fetch(`${API_URL}/users/requests/${requestId}/accept`, {
            method: 'POST',
            headers: {
                'x-auth-token': token
            }
        });
        
        if (response.ok) {
            alert('Follow request accepted!');
            loadFollowRequests();
            loadUserData();
        } else {
            alert('Error accepting follow request');
        }
    } catch (error) {
        console.error('Error accepting follow request:', error);
        alert('Error accepting follow request');
    }
}

async function rejectFollowRequest(requestId) {
    try {
        const response = await fetch(`${API_URL}/users/requests/${requestId}/reject`, {
            method: 'POST',
            headers: {
                'x-auth-token': token
            }
        });
        
        if (response.ok) {
            alert('Follow request rejected');
            loadFollowRequests();
        } else {
            alert('Error rejecting follow request');
        }
    } catch (error) {
        console.error('Error rejecting follow request:', error);
        alert('Error rejecting follow request');
    }
}