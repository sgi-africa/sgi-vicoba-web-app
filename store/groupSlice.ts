import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { GroupResponse, GroupState } from "@/interfaces/interface"

const initialState: GroupState = {
    groups: [],
    activeGroup: null,
    sharesConfiguredGroupIds: [],
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
        markSharesConfigured: (state, action: PayloadAction<number>) => {
            const groupId = action.payload
            const ids = state.sharesConfiguredGroupIds ?? []
            if (!ids.includes(groupId)) {
                state.sharesConfiguredGroupIds = [...ids, groupId]
            }
        },
    },
})

export const { setGroups, addGroup, setActiveGroup, markSharesConfigured } = groupSlice.actions
export default groupSlice.reducer