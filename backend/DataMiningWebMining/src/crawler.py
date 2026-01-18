# crawler.py
from .github_client import fetch_user_data  # Import Member 1's function


def run_crawler(start_username, max_nodes=30):
    """
    Executes Breadth-First Search (BFS) to build the network dataset.
    Returns a list of edges: [('UserA', 'UserB'), ('UserB', 'UserC')]
    """
    queue = [start_username]
    visited = set()
    raw_edges = []
    nodes_data = {}  # To store follower counts for Member 3

    print(f"🕷️ Crawling started for: {start_username}")

    while queue and len(visited) < max_nodes:
        current_user = queue.pop(0)

        if current_user in visited:
            continue
        visited.add(current_user)

        # Call Member 1's function to get real data
        data = fetch_user_data(current_user)
        if not data:
            print(f"No data found for {current_user}")
        else:
            print(f"Found {len(data['following'])} connections for {current_user}")
        if data:
            # Store node info (followers count)
            nodes_data[current_user] = data["followers_count"]

            # Process edges
            for target in data["following"]:
                raw_edges.append((current_user, target))

                # Add new people to queue if not visited
                if target not in visited:
                    queue.append(target)

    return raw_edges, nodes_data