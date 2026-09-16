// code by Nikhil-51
export interface Story {
    id: string;
    title: string;
    author_id: string;
    summary: string;
    cover_url: string | null;
    created_at: string;
    content?: string;
    type: 'story' | 'novel' | 'chapter';
    genre?: string;
    parent_id?: string | null;
}

export interface Profile {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
}
