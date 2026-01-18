import networkx as nx
import community.community_louvain as community_louvain
from collections import Counter

# --- VISUALIZATION SETUP ---
import matplotlib

matplotlib.use('Agg')  # Prevents "GUI" crashes
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches  # Needed for the custom legend
from pyvis.network import Network


def process_graph(raw_edges, nodes_data):
    """
    Main function to analyze the graph and generate reports.
    """
    G = nx.Graph()
    G.add_edges_from(raw_edges)

    # Check if graph has nodes
    if len(G.nodes()) == 0:
        raise ValueError("Graph has no nodes. Cannot process empty graph.")

    # 1. Algorithms
    try:
        partition = community_louvain.best_partition(G)
    except:
        partition = {n: 0 for n in G.nodes()}

    # Calculate pagerank - handle empty graph case
    try:
        pagerank = nx.pagerank(G)
    except Exception as e:
        # If pagerank fails (e.g., empty graph), assign equal values
        pagerank = {n: 1.0 / len(G.nodes()) if len(G.nodes()) > 0 else 0.0 for n in G.nodes()}

    # 2. AUTO-NAMING ALGORITHM (NEW) 
    # Names the group after the person with the highest PageRank in that group
    community_names = get_community_names(partition, pagerank)

    # 3. GENERATE REPORTS
    print_stats_to_console(G, partition, pagerank)

    # Save static image (PNG) with Legend
    save_graph_image(G, partition, community_names)

    # Save interactive website (HTML) with Tooltips
    # save_interactive_graph(G, partition, pagerank, community_names)

    # 4. Format Output for Frontend (React)
    nodes = []
    for node in G.nodes():
        group_id = partition.get(node, 0)
        nodes.append({
            "id": node,
            "group": group_id,
            # Pass the name to frontend (Optional usage)
            "group_name": community_names.get(group_id, f"Group {group_id}"),
            "val": pagerank.get(node, 0) * 1000,
            "followers": nodes_data.get(node, 0)
        })

    links = [{"source": u, "target": v} for u, v in G.edges()]

    return {"nodes": nodes, "links": links}


# ==========================================
# HELPER: NAMING ALGORITHM
# ==========================================
def get_community_names(partition, pagerank):
    """
    Finds the 'Leader' of each group (highest PageRank)
    and names the group 'The [Leader] Cluster'.
    """
    groups = {}
    # Organize users by group
    for user, group_id in partition.items():
        if group_id not in groups:
            groups[group_id] = []
        groups[group_id].append(user)

    # Find leader for each group
    group_names = {}
    for group_id, users in groups.items():
        # Find user in this list with max pagerank
        leader = max(users, key=lambda u: pagerank.get(u, 0))
        group_names[group_id] = f"The {leader} Cluster"

    return group_names


# ==========================================
# HELPER 1: TEXT REPORT
# ==========================================
def print_stats_to_console(G, partition, pagerank):
    print("\n" + "=" * 50)
    print("BACKEND DATA MINING REPORT")
    print("=" * 50)
    print(f"Nodes: {len(G.nodes)} | Edges: {len(G.edges)}")

    sorted_pr = sorted(pagerank.items(), key=lambda x: x[1], reverse=True)[:5]
    print(f"\nTop 5 Influencers:")
    for rank, (user, score) in enumerate(sorted_pr, 1):
        print(f"   {rank}. {user} (Score: {score:.4f})")

    counts = Counter(partition.values())
    print(f"\nLargest Communities:")
    for group_id, count in counts.most_common(3):
        print(f"   - Group {group_id}: {count} members")
    print("=" * 50 + "\n")


# ==========================================
#  HELPER 2: STATIC IMAGE (PNG)
# ==========================================
def save_graph_image(G, partition, community_names):
    print("Generating 'graph_debug.png' with Legends...")
    
    # Check if graph is empty
    if len(G.nodes()) == 0:
        print("Warning: Graph is empty, skipping image generation.")
        return
        
    plt.figure(figsize=(12, 10))

    pos = nx.spring_layout(G, k=0.15, iterations=20)

    # Define colors - handle empty partition
    max_group = max(partition.values()) if partition else 0
    # Use matplotlib colormap - compatible with all versions
    try:
        # For matplotlib >= 3.5
        cmap = plt.colormaps['tab20'].resampled(max_group + 1 if max_group > 0 else 1)
    except (AttributeError, KeyError):
        # Fallback for older matplotlib versions
        cmap = plt.cm.get_cmap('tab20', max_group + 1 if max_group > 0 else 1)

    nx.draw_networkx_nodes(G, pos,
                           partition.keys(),
                           node_size=120,
                           cmap=cmap,
                           node_color=list(partition.values()))

    nx.draw_networkx_edges(G, pos, alpha=0.3)

    # --- DRAW LEGEND ---
    # Create a fake handle for top 5 groups
    top_groups = Counter(partition.values()).most_common(5)
    legend_elements = []

    for group_id, count in top_groups:
        name = community_names.get(group_id, f"Group {group_id}")
        color = cmap(group_id)
        patch = mpatches.Patch(color=color, label=f"{name} ({count})")
        legend_elements.append(patch)

    plt.legend(handles=legend_elements, loc='upper right', title="Top Communities")
    # -------------------

    plt.title("GitHub Network Snapshot")
    plt.axis('off')
    plt.savefig("graph_debug.png")
    plt.close()
    print("PNG Image saved.")

#
# # ==========================================
# #  HELPER 3: INTERACTIVE GRAPH (HTML)
# # ==========================================
# def save_interactive_graph(G, partition, pagerank, community_names):
#     print("Generating 'community_graph.html'...")
#
#     net = Network(height="750px", width="100%", bgcolor="#222222", font_color="white")
#
#     for node in G.nodes():
#         group_id = partition.get(node, 0)
#         size = pagerank.get(node, 0) * 1000
#
#         # Get the smart name
#         group_name = community_names.get(group_id, f"Group {group_id}")
#
#         # Tooltip shows the name!
#         hover_text = f"User: {node}\nCommunity: {group_name}"
#
#         net.add_node(node, label=node, title=hover_text, value=size, group=group_id)
#
#     for source, target in G.edges():
#         net.add_edge(source, target)
#
#     net.barnes_hut(gravity=-8000, central_gravity=0.3, spring_length=95)
#     net.save_graph("community_graph.html")
#     print("HTML Graph saved.\n")