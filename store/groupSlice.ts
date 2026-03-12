import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { GroupResponse, GroupState } from "@/interfaces/interface"

const initialState: GroupState = {
    groups: [],
    activeGroup: null,
}

const groupSlice = createSlice({
    name: "group",
    initialState,
    reducers: {
        setGroups: (state, action: PayloadAction<GroupResponse[]>) => {
            state.groups = action.payload
        },
        addGroup: (state, action: PayloadAction<GroupResponse>) => {
            if (!state.groups.some((g) => g.id === action.payload.id)) {
                state.groups = [action.payload, ...state.groups]
            }
        },
        setActiveGroup: (state, action: PayloadAction<GroupResponse>) => {
            state.activeGroup = action.payload
        },
    },
})

export const { setGroups, addGroup, setActiveGroup } = groupSlice.actions
export default groupSlice.reducer